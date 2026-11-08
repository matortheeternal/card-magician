import { countRulesWords, creatureTypes } from './textAnalysis.js';
import { localizeStatisticsText } from './localization.js';

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
export const CARD_TYPES = [
    'Creature', 'Instant', 'Sorcery', 'Artifact', 'Enchantment',
    'Land', 'Planeswalker', 'Other'
];

const CARD_TYPE_PATTERNS = CARD_TYPES.filter(type => type !== 'Other')
    .map(type => ({ type, pattern: new RegExp(`\\b${type}\\b`, 'i') }));
const TRIBAL_PATTERN = /\btribal\b/i;

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

function createColorIdentity(cost, override, game) {
    const identity = new game.ColorIdentity();
    if (cost?.symbols) identity.addColorSource('card', cost.symbols);
    if (override) identity.setOverride(override);
    return identity;
}

function getColor(cost, override, game) {
    const colors = createColorIdentity(cost, override, game).getColors();
    if (override?.includes('c')) return 'c';
    if (colors.length > 1 || override?.includes('m')) return 'm';
    return colors[0]?.char || 'c';
}

function getCardTypes(superType = '') {
    const types = CARD_TYPE_PATTERNS
        .filter(({ pattern }) => pattern.test(superType))
        .map(({ type }) => type);
    if (TRIBAL_PATTERN.test(superType) && !types.includes('Kindred'))
        types.push('Kindred');
    return types.length ? types : ['Other'];
}

function getRarity(value) {
    const rarity = (value || 'common').toLowerCase();
    return RARITIES.includes(rarity) ? rarity : 'unknown';
}

function getManaValue(cost) {
    const value = cost ? Number(cost.cmc) : 0;
    return Number.isFinite(value) && value >= 0 ? value : null;
}

export function cardRecord(card, game) {
    const face = card.front || {};
    const cost = parseManaCost(face.manaCost, game);
    const types = getCardTypes(face.superType);
    return {
        color: getColor(cost, getColorOverride(face.colorOverride), game),
        rarity: getRarity(face.rarity),
        types,
        manaValue: getManaValue(cost),
        isLand: types.includes('Land'),
        wordCount: countRulesWords(face.rulesText),
        creatureTypes: creatureTypes(face),
        name: face.name || localizeStatisticsText('Unnamed card')
    };
}
