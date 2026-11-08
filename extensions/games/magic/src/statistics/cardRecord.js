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

function tryParseCost(game, cost) {
    try {
        return game.ManaScribe.ManaCost.parse(cost);
    } catch {
        return { cmc: NaN };
    }
}

export function cardRecord(card, game) {
    const face = card.front || {};
    let cost = face.manaCost;
    if (typeof cost === 'string')
        cost = tryParseCost(game, cost);
    const identity = new game.ColorIdentity();
    if (cost?.symbols) identity.addColorSource('card', cost.symbols);
    const override = Array.isArray(face.colorOverride)
        ? face.colorOverride.join('') : face.colorOverride;
    if (override) identity.setOverride(override);
    const colors = identity.getColors();
    let color = colors[0]?.char || 'c';
    if (colors.length > 1 || override?.includes('m')) color = 'm';
    if (override?.includes('c')) color = 'c';
    const types = CARD_TYPES.filter(type => type !== 'Other'
        && new RegExp(`\\b${type}\\b`, 'i').test(face.superType || ''));
    if (/\btribal\b/i.test(face.superType || '') && !types.includes('Kindred'))
        types.push('Kindred');
    let rarity = (face.rarity || 'common').toLowerCase();
    if (!RARITIES.includes(rarity)) rarity = 'unknown';
    const manaValue = cost ? Number(cost.cmc) : 0;
    return {
        color,
        rarity,
        types: types.length ? types : ['Other'],
        isAuxiliary: /\b(token|emblem)\b/i.test(face.superType || '')
            || /\/(Token|Emblem)(\/|$)/i.test(face.template || ''),
        manaValue: Number.isFinite(manaValue) && manaValue >= 0 ? manaValue : null,
        isLand: types.includes('Land')
    };
}

