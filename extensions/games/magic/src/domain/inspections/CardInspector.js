import { CardColors, PieInspector } from 'oracle-of-pie';
import { getPrintedColors } from '../ColorIdentity.js';
import { getCardFaces, isOracleCard } from '../oracleCardEligibility.js';
import { CARD_INSPECTIONS } from './cardInspections.js';
import InspectionOverrides from './InspectionOverrides.js';
import InspectionFinding from './InspectionFinding.js';
import { hasRulesText } from './faceTraits.js';
import parsedRules from './parsedRules.js';
import rulesRange from './rulesRange.js';

import pieFindingMessage from './pieFindingMessage.js';

function pieFace(face, card) {
    const manaCost = face.manaCost?.toString() ?? '';
    const colors = new CardColors({ colors: getPrintedColors(face), manaCost });
    return { parsed: parsedRules(face, card), colors };
}

export default class CardInspector {
    settingsId = 'cm-magic-inspection-settings';
    #pie;
    #overridesKey;

    pieInspector(project) {
        const overrides = project.inspectionOverrides ?? {};
        const key = JSON.stringify(overrides);
        if (key !== this.#overridesKey) {
            this.#pie = new PieInspector({ overrides });
            this.#overridesKey = key;
        }
        return this.#pie;
    }

    pieFindings(card, project) {
        const faces = getCardFaces(card).filter(hasRulesText);
        if (!faces.length) return [];
        const inputs = faces.map(face => pieFace(face, card));
        const findings = [];
        for (const flag of this.pieInspector(project).judgedOccurrences(inputs)) {
            if (!flag) continue;
            const { faceIndex, range } = flag.attribution;
            const location = rulesRange(range);
            const message = pieFindingMessage(flag);
            findings.push(new InspectionFinding(
                flag.inspection.id, card, faces[faceIndex], message, location
            ));
        }
        return findings;
    }

    *inspectProject(project, showUnrecognized) {
        const cards = [...project.cards];
        const contexts = new Map();
        for (const inspection of CARD_INSPECTIONS) {
            if (inspection.projectContext)
                contexts.set(inspection.id, inspection.projectContext(cards));
        }
        for (const card of cards)
            yield [card, this.inspect(card, project, showUnrecognized, contexts)];
    }

    inspect(card, project, showUnrecognized, contexts) {
        if (!isOracleCard(card)) return [];
        const overrides = new InspectionOverrides(project, CARD_INSPECTIONS);
        const findings = [];
        for (const inspection of CARD_INSPECTIONS) {
            if (!overrides.isEnabled(inspection.id)) continue;
            if (inspection.id === 'unrecognized-text' && !showUnrecognized) continue;
            const context = contexts?.get(inspection.id);
            const result = inspection.inspectCard?.(card, project, context)
                ?? inspection.inspect([card], project);
            findings.push(...result);
        }
        findings.push(...this.pieFindings(card, project));
        return findings;
    }
}
