import CardInspection from '../CardInspection.js';
import { DESIGN, MANA_COSTS } from '../categories.js';
import { costSymbols, isSpecial } from './manaSymbols.js';

const L = localize('game-magic');
const TYPE_LIMIT = 2;
const DESCRIPTION = L`Mana costs mixing three or more kinds of colored mana symbols.`;

export default class ManySymbolTypes extends CardInspection {
    constructor() {
        super({
            id: 'many-mana-symbol-types',
            title: L`Too many kinds of mana symbols`,
            category: DESIGN,
            group: MANA_COSTS,
            description: DESCRIPTION
        });
    }

    findingFor(face) {
        const special = costSymbols(face).filter(isSpecial);
        const types = new Set(special.map(symbol => symbol.type));
        if (types.size <= TYPE_LIMIT) return null;
        return L`Mana cost uses ${types.size} kinds of mana symbols.`;
    }
}
