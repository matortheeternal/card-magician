export function isUninitializedCard(card) {
    return Object.keys(card.front).length < 2;
}

export function isColorless(card) {
    if (card.front.colors?.length) return false;
    return !isArtifact(card) && !isLand(card);
}

export function isMonoColor(card, color) {
    return card.front.colors?.length === 1
        && card.front.colors[0].name === color;
}

export function isArtifact(card) {
    return /\bArtifact\b/i.test(card.front.superType || '');
}

export function isLand(card) {
    return /\bLand\b/i.test(card.front.superType || '');
}

export function isBasicLand(card) {
    return /\bBasic Land\b/i.test(card.front.superType || '');
}

export function isMulticolor(card) {
    return card.front.colors?.length
        && card.front.colors.length > 1;
}
