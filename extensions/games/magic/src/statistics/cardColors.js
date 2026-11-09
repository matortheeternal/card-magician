function colorCategory(override, colors) {
    if (override?.includes('c')) return 'c';
    if (colors.length > 1 || override?.includes('m')) return 'm';
    return colors[0] || 'c';
}

function exactColors(cost, override, colors) {
    if (override?.includes('c')) return [];
    if (override && !colors.length) return null;
    if (override || !cost || cost.symbols) return colors;
    return null;
}

function combination(colors) {
    if (colors === null) return null;
    return colors.join('') || 'c';
}

export function cardColors(cost, override, game) {
    const identity = new game.ColorIdentity();
    if (cost?.symbols) identity.addColorSource('card', cost.symbols);
    if (override) identity.setOverride(override);
    const colors = identity.getColors().map(color => color.char);
    const exact = exactColors(cost, override, colors);
    return {
        color: colorCategory(override, colors),
        colorCombination: combination(exact),
        colorCount: exact?.length ?? null
    };
}
