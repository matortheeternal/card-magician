import Inspection from './Inspection.js';
import InspectionFinding from './InspectionFinding.js';
import { getCardFaces, isOracleCard } from '../oracleCardEligibility.js';

export default class CardInspection extends Inspection {
    inspect(cards, project) {
        const findings = [];
        for (const card of cards) {
            if (!isOracleCard(card)) continue;
            for (const face of getCardFaces(card))
                this.collect(findings, card, face, project);
        }
        return findings;
    }

    collect(findings, card, face, project) {
        const message = this.findingFor(face, card, project);
        if (message) findings.push(new InspectionFinding(this.id, card, face, message));
    }

    findingFor() {
        return null;
    }
}
