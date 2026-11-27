import Inspection from '../Inspection.js';
import InspectionFinding from '../InspectionFinding.js';
import { DESIGN } from '../categories.js';
import { isOracleCard } from '../../oracleCardEligibility.js';
import { isBasicLand, isToken } from '../../cardTraits/cardTypes.js';

const L = localize('game-magic');

function nameKey(face) {
    return face.name?.trim().toLowerCase() ?? '';
}

function isNamedCard(card) {
    const face = card.front;
    return Boolean(face && nameKey(face)) && isOracleCard(card)
        && !isToken(face) && !isBasicLand(face);
}

function cardsByName(cards) {
    const byName = new Map();
    for (const card of cards.filter(isNamedCard)) {
        const key = nameKey(card.front);
        byName.set(key, [...byName.get(key) ?? [], card]);
    }
    return byName;
}

export default class DuplicateNames extends Inspection {
    constructor() {
        super({
            id: 'duplicate-names',
            title: L`Duplicate card names`,
            category: DESIGN,
            description: L`Cards sharing a name, not counting tokens and basic lands.`
        });
    }

    inspect(cards) {
        const findings = [];
        for (const named of cardsByName(cards).values()) {
            if (named.length < 2) continue;
            const message = L`${named.length} cards are named ${named[0].front.name}.`;
            for (const card of named)
                findings.push(new InspectionFinding(this.id, card, card.front, message));
        }
        return findings;
    }
}
