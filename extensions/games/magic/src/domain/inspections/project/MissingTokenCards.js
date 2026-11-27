import Inspection from '../Inspection.js';
import InspectionFinding from '../InspectionFinding.js';
import { COMPLETENESS } from '../categories.js';
import createdTokenNames from './createdTokenNames.js';
import { getCardFaces, isOracleCard } from '../../oracleCardEligibility.js';
import { isToken } from '../../cardTraits/cardTypes.js';

const L = localize('game-magic');

function tokenKeys(cards) {
    const keys = new Set();
    for (const face of cards.flatMap(getCardFaces).filter(isToken)) {
        keys.add(face.name?.trim().toLowerCase());
        keys.add(face.subType?.trim().toLowerCase());
    }
    return keys;
}

export default class MissingTokenCards extends Inspection {
    constructor() {
        super({
            id: 'missing-token-cards',
            title: L`Tokens without a token card`,
            category: COMPLETENESS,
            description: L`Tokens that cards create without a matching token card.`
        });
    }

    inspect(cards) {
        const known = tokenKeys(cards);
        const findings = [];
        for (const card of cards.filter(isOracleCard)) {
            for (const face of getCardFaces(card).filter(item => !isToken(item)))
                this.collect(findings, card, face, known);
        }
        return findings;
    }

    collect(findings, card, face, known) {
        const missing = createdTokenNames(face, card)
            .filter(name => !known.has(name.toLowerCase()));
        for (const name of missing) {
            const message = L`No token card for the ${name} token.`;
            findings.push(new InspectionFinding(this.id, card, face, message));
        }
    }
}
