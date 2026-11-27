const PHYREXIAN_TYPES = new Set([
    'coloredPhyrexianMana', 'hybridPhyrexianMana', 'colorlessPhyrexianMana'
]);
const HYBRID_TYPES = new Set([
    'twoColorHybridMana', 'threeColorHybridMana', 'fourColorHybridMana',
    'fiveColorHybridMana', 'colorlessHybridMana', 'genericHybridMana'
]);
const PLAIN_TYPES = new Set([
    'genericMana', 'variableMana', 'colorlessMana', 'typedMana'
]);

function parseCost(cost) {
    if (!cost) return null;
    if (typeof cost !== 'string') return cost;
    return activeGame.ManaScribe.ManaCost.parse(cost);
}

export function costSymbols(face) {
    return parseCost(face.manaCost)?.symbols ?? [];
}

export function isPhyrexian(symbol) {
    return PHYREXIAN_TYPES.has(symbol.type);
}

export function isHybrid(symbol) {
    return HYBRID_TYPES.has(symbol.type);
}

export function isSpecial(symbol) {
    return !PLAIN_TYPES.has(symbol.type);
}

export function costColors(face) {
    return new Set(costSymbols(face).flatMap(symbol => symbol.colors ?? []));
}
