import { Query } from 'oracle-of-pie';
import CardInspection from '../CardInspection.js';
import { DESIGN, MANA_COSTS } from '../categories.js';
import { hasRulesText } from '../faceTraits.js';
import parsedRules from '../parsedRules.js';
import { costColors } from './manaSymbols.js';
import { isLand } from '../../cardTraits/cardTypes.js';

const L = localize('game-magic');
const ACTIVATED_ABILITY = Query.compile({ kind: 'ActivatedAbility' });
const SYMBOL = /\{([^{}]+)\}/g;
const COLOR_LETTER = /^[WUBRG]$/;

function cardColors(face) {
    const override = [face.colorOverride ?? []].flat().join('').toUpperCase();
    const overridden = [...override].filter(letter => COLOR_LETTER.test(letter));
    return new Set([...costColors(face), ...overridden]);
}

function costSymbols(ability) {
    const cost = ability.raw.split(':')[0];
    const braced = [...cost.matchAll(SYMBOL)].map(([symbol]) => symbol).join('');
    return activeGame.ManaScribe.ManaCost.parse(braced).symbols;
}

function isOffColor(symbol, colors) {
    const symbolColors = symbol.colors ?? [];
    return symbolColors.length > 0 && !symbolColors.some(color => colors.has(color));
}

export default class OffColorActivation extends CardInspection {
    constructor() {
        super({
            id: 'off-color-activation',
            title: L`Activation costs outside the card's colors`,
            category: DESIGN,
            group: MANA_COSTS,
            description: L`Nonland cards with activated abilities that cost other colors.`
        });
    }

    findingFor(face, card) {
        if (isLand(face) || !hasRulesText(face)) return null;
        const colors = cardColors(face);
        const abilities = parsedRules(face, card).text.abilities
            .filter(ability => ACTIVATED_ABILITY.test(ability));
        const symbols = abilities.flatMap(costSymbols);
        const symbol = symbols.find(item => isOffColor(item, colors));
        if (!symbol) return null;
        return L`Activation cost uses {${symbol.raw}} outside this card's colors.`;
    }
}
