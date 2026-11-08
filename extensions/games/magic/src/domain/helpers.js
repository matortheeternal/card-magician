const ARTIFACT_PATTERN = /\bArtifact\b/i;
const LAND_PATTERN = /\bLand\b/i;
const BASIC_LAND_PATTERN = /\bBasic Land\b/i;
const TOKEN_PATTERN = /\bToken\b/i;
const EMBLEM_PATTERN = /\bEmblem\b/i;
const CREATURE_PATTERN = /\bCreature\b/i;
export function isUninitializedCard(card) {
    return Object.keys(card.front).length < 2;
}

export function isColorless(card) {
    if (card.front.colors?.length) return false;
    return !isArtifact(card) && !isLand(card);
}

export function isMonoColor(card, color) {
    return !isLand(card)
        && card.front.colors?.length === 1
        && card.front.colors[0].name === color;
}

export function isArtifact(card) {
    return ARTIFACT_PATTERN.test(card.front.superType || '');
}

export function isLand(card) {
    return LAND_PATTERN.test(card.front.superType || '');
}

export function isBasicLand(card) {
    return BASIC_LAND_PATTERN.test(card.front.superType || '');
}

export function isMulticolor(card) {
    return  !isLand(card)
        && card.front.colors?.length
        && card.front.colors.length > 1;
}

export function isToken(card) {
    return TOKEN_PATTERN.test(card.front.superType || '');
}

export function isEmblem(card) {
    return EMBLEM_PATTERN.test(card.front.superType || '');
}

export function isCreature(card) {
    return CREATURE_PATTERN.test(card.front.superType || '');
}
