import rulesRange from '../rulesRange.js';
import CardInspection from '../CardInspection.js';
import { TEMPLATING, OUTDATED_WORDING } from '../categories.js';
import { isLegendary } from '../../cardTraits/cardTypes.js';

const L = localize('game-magic');
const DESCRIPTION = L([
    'Around 2024 (date to verify), nonlegendary cards began using phrases like'
    + ' “this creature” or “this permanent” in place of their own names.'
]);
const NAME_MACRO = 'CARDNAME|~|@';
const REGEX_SPECIAL = /[.*+?^${}()|[\]\\]/g;

function referencePattern(name) {
    const escaped = name?.trim().replace(REGEX_SPECIAL, '\\$&');
    const ownName = escaped ? `|\\b${escaped}\\b` : '';
    return new RegExp(NAME_MACRO + ownName, 'g');
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

    findingsFor(face) {
        if (!face.rulesText || isLegendary(face)) return [];
        const matches = face.rulesText.matchAll(referencePattern(face.name));
        return Array.from(matches, match => ({
            message: L`Card refers to itself by name.`,
            location: rulesRange({
                start: match.index, end: match.index + match[0].length
            })
        }));
    }
}
