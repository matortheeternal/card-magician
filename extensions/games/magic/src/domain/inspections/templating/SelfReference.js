import CardInspection from '../CardInspection.js';
import { TEMPLATING, OUTDATED_WORDING } from '../categories.js';
import { isLegendary } from '../../cardTraits/cardTypes.js';

const L = localize('game-magic');
const DESCRIPTION
    = L`Nonlegendary cards that name themselves instead of saying “this creature”.`;
const NAME_MACRO = /CARDNAME|~|@/;
const REGEX_SPECIAL = /[.*+?^${}()|[\]\\]/g;

function mentionsOwnName(face) {
    const name = face.name?.trim();
    if (!name) return false;
    const escaped = name.replace(REGEX_SPECIAL, '\\$&');
    return new RegExp(`\\b${escaped}\\b`).test(face.rulesText);
}

export default class SelfReference extends CardInspection {
    constructor() {
        super({
            id: 'wording-self-reference',
            title: L`Refers to itself by name`,
            category: TEMPLATING,
            group: OUTDATED_WORDING,
            description: DESCRIPTION,
            enabledByDefault: false
        });
    }

    findingFor(face) {
        if (!face.rulesText || isLegendary(face)) return null;
        if (!NAME_MACRO.test(face.rulesText) && !mentionsOwnName(face)) return null;
        return L`Card refers to itself by name.`;
    }
}
