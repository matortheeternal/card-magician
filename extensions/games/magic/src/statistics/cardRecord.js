import { CARD_TYPES, getCardTypes, isLand, isPermanent, isLegendary }
    from '../domain/cardTraits/cardTypes.js';
import { cardColors } from './cardColors.js';
import { creatureStats } from './creatureStats.js';
import {
    countRulesWords, creatureTypes, nonCreatureSubtypes
} from './textAnalysis.js';
import { localizeStatisticsText } from './localization.js';

export { CARD_TYPES };

export const COLORS = [
    { id: 'w', label: 'White', color: '#e8dca4' },
    { id: 'u', label: 'Blue', color: '#63b5ed' },
    { id: 'b', label: 'Black', color: '#b397ce' },
    { id: 'r', label: 'Red', color: '#ed8179' },
    { id: 'g', label: 'Green', color: '#75c79b' },
    { id: 'm', label: 'Multicolor', color: '#d9ad51' },
    { id: 'c', label: 'Colorless', color: '#aab4c0' }
];
export const RARITIES = ['common', 'uncommon', 'rare', 'mythic', 'special'];

function parseManaCost(cost, game) {
    if (typeof cost !== 'string') return cost;
    try {
        return game.ManaScribe.ManaCost.parse(cost);
    } catch {
        return { cmc: NaN };
    }
}

function getColorOverride(override) {
    return Array.isArray(override) ? override.join('') : override;
}

function getRarity(value) {
    const rarity = (value || 'common').toLowerCase();
    return RARITIES.includes(rarity) ? rarity : 'unknown';
}

function getManaValue(cost) {
    const value = cost ? Number(cost.cmc) : 0;
    return Number.isFinite(value) && value >= 0 ? value : null;
}

function hasArtCredit(face, project) {
    const credit = face.illustrator || project?.illustrator || '';
    return Boolean(String(credit).trim());
}

export function cardRecord(card, game, project) {
    const face = card.front || {};
    const cost = parseManaCost(face.manaCost, game);
    const types = getCardTypes(face);
    return {
        ...cardColors(cost, getColorOverride(face.colorOverride), game),
        ...creatureStats(face, types.includes('Creature')),
        hasArtCredit: hasArtCredit(face, project),
        rarity: getRarity(face.rarity),
        types,
        manaValue: getManaValue(cost),
        isLand: isLand(face),
        isPermanent: isPermanent(face),
        isLegendary: isLegendary(face),
        wordCount: countRulesWords(face.rulesText),
        creatureTypes: creatureTypes(face),
        nonCreatureSubtypes: nonCreatureSubtypes(face),
        name: face.name || localizeStatisticsText('Unnamed card')
    };
}
