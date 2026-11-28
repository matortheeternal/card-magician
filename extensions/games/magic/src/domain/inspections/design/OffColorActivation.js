import { Query } from 'oracle-of-pie';
import CardInspection from '../CardInspection.js';
import { DESIGN, MANA_COSTS } from '../categories.js';
import { hasRulesText } from '../faceTraits.js';
import locatedAbilities from '../locatedAbilities.js';
import rulesRange from '../rulesRange.js';
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

    findingsFor(face, card) {
        if (isLand(face) || !hasRulesText(face)) return [];
        const colors = cardColors(face);
        const findings = [];
        for (const { ability, range } of locatedAbilities(face, card)) {
            if (!ACTIVATED_ABILITY.test(ability)) continue;
            const symbol = costSymbols(ability).find(item => isOffColor(item, colors));
            if (!symbol) continue;
            const message = L`Activation uses {${symbol.raw}} outside the card's colors.`;
            findings.push({ message, location: rulesRange(range) });
        }
        return findings;
    }
}
