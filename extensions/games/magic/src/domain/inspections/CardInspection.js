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
        const matches = this.findingsFor(face, card, project);
        for (const { message, location, resolution } of matches) {
            findings.push(new InspectionFinding(
                this.id, card, face, message, location, resolution
            ));
        }
    }

    findingsFor(face, card, project) {
        const message = this.findingFor(face, card, project);
        const location = this.field ? { field: this.field } : null;
        const resolution = this.resolution && { label: this.resolution, type: 'focus' };
        return message ? [{ message, location, resolution }] : [];
    }

    findingFor() {
        return null;
    }
}
