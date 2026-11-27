import CardInspection from '../CardInspection.js';
import { DESIGN, MANA_COSTS } from '../categories.js';
import { costSymbols, isHybrid } from './manaSymbols.js';

const L = localize('game-magic');

export default class MixedHybridPips extends CardInspection {
    constructor() {
        super({
            id: 'mixed-hybrid-pips',
            title: L`Several different hybrid symbols`,
            category: DESIGN,
            group: MANA_COSTS,
            description: L`Mana costs mixing two or more different hybrid symbols.`
        });
    }

    findingFor(face) {
        const hybrid = costSymbols(face).filter(isHybrid);
        const hybrids = new Set(hybrid.map(symbol => symbol.raw));
        if (hybrids.size < 2) return null;
        return L`Mana cost mixes ${[...hybrids].map(raw => `{${raw}}`).join('')}.`;
    }
}
