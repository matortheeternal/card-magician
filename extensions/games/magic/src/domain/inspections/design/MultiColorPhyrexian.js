import CardInspection from '../CardInspection.js';
import { DESIGN, MANA_COSTS } from '../categories.js';
import { costSymbols, isPhyrexian } from './manaSymbols.js';

const L = localize('game-magic');

export default class MultiColorPhyrexian extends CardInspection {
    constructor() {
        super({
            id: 'multicolor-phyrexian',
            title: L`Phyrexian mana in several colors`,
            category: DESIGN,
            group: MANA_COSTS,
            description: L`Mana costs with Phyrexian symbols of two or more colors.`
        });
    }

    findingFor(face) {
        const phyrexian = costSymbols(face).filter(isPhyrexian);
        const colors = new Set(phyrexian.flatMap(symbol => symbol.colors));
        if (colors.size < 2) return null;
        return L`Phyrexian mana in ${[...colors].join(', ')}.`;
    }
}
