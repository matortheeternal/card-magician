export const COLORS = [
    { id: 'w', label: 'White', color: '#e8dca4' },
    { id: 'u', label: 'Blue', color: '#63b5ed' },
    { id: 'b', label: 'Black', color: '#b397ce' },
    { id: 'r', label: 'Red', color: '#ed8179' },
    { id: 'g', label: 'Green', color: '#75c79b' },
    { id: 'm', label: 'Multicolor', color: '#d9ad51' },
    { id: 'c', label: 'Colorless', color: '#aab4c0' }
];
export const RARITIES = ['common', 'uncommon', 'rare', 'mythic', 'special', 'basic', 'unknown'];
export const CARD_TYPES = [
    'Creature', 'Instant', 'Sorcery', 'Artifact', 'Enchantment',
    'Land', 'Planeswalker', 'Battle', 'Kindred', 'Other'
];

export function cardRecord(card, game) {
    const face = card.front || {};
    let cost = face.manaCost;
    if (typeof cost === 'string')
        try { cost = game.ManaScribe.ManaCost.parse(cost); } catch { cost = { cmc: NaN }; }
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
    if (rarity === 'mythic rare') rarity = 'mythic';
    if (rarity === 'basic land') rarity = 'basic';
    if (rarity === 'land') rarity = 'basic';
    if (!RARITIES.includes(rarity)) rarity = 'unknown';
    const manaValue = cost ? Number(cost.cmc) : 0;
    return {
        color, rarity, types: types.length ? types : ['Other'],
        manaValue: Number.isFinite(manaValue) && manaValue >= 0 ? manaValue : null,
        isLand: types.includes('Land')
    };
}

export function aggregateStatistics(records, { includeLands = false } = {}) {
    const rarity = COLORS.map(() => RARITIES.map(() => 0));
    const type = COLORS.map(() => CARD_TYPES.map(() => 0));
    const totals = COLORS.map(() => 0);
    for (const record of records) {
        const row = COLORS.findIndex(color => color.id === record.color);
        totals[row]++;
        rarity[row][RARITIES.indexOf(record.rarity)]++;
        for (const cardType of record.types)
            type[row][CARD_TYPES.indexOf(cardType)]++;
    }
    const curveRecords = records.filter(record => (includeLands || !record.isLand)
        && record.manaValue !== null);
    // Preserve fractional values, while bounding unusually large custom costs.
    const values = [...new Set([0, ...curveRecords.map(record => Math.min(20, record.manaValue))])];
    const max = Math.max(...values);
    for (let i = 0; i <= max; i++) if (!values.includes(i)) values.push(i);
    values.sort((a, b) => a - b);
    const series = COLORS.map(color => ({ ...color, values: values.map(() => 0) }));
    for (const record of curveRecords) {
        const row = COLORS.findIndex(color => color.id === record.color);
        series[row].values[values.indexOf(Math.min(20, record.manaValue))]++;
    }
    return {
        rarity, type, totals, series, values,
        labels: values.map(value => value === 20 ? '20+' : String(value)),
        total: records.length, curveTotal: curveRecords.length,
        invalidCosts: records.filter(record => (includeLands || !record.isLand)
            && record.manaValue === null).length
    };
}
