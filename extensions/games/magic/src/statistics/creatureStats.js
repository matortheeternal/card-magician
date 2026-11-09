const NUMERIC_STAT_PATTERN = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/;
const SHAPES = new Map([[0, 'square'], [1, 'aggressive'], [-1, 'defensive']]);

function numericStat(value) {
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    if (typeof value !== 'string') return null;
    if (!NUMERIC_STAT_PATTERN.test(value.trim())) return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
}

function creatureShape(power, toughness) {
    if (power === null || toughness === null) return null;
    return SHAPES.get(Math.sign(power - toughness));
}

export function creatureStats(face, isCreature) {
    if (!isCreature) return { power: null, toughness: null, creatureShape: null };
    const power = numericStat(face.power);
    const toughness = numericStat(face.toughness);
    return { power, toughness, creatureShape: creatureShape(power, toughness) };
}
