export const EVERGREEN_KEYWORDS = new Set([
    'deathtouch', 'defender', 'double strike', 'enchant', 'equip', 'first strike',
    'flash', 'flying', 'haste', 'hexproof', 'indestructible', 'lifelink', 'menace',
    'protection', 'reach', 'trample', 'vigilance'
]);

export function isEvergreen(keyword) {
    return EVERGREEN_KEYWORDS.has(keyword.toLowerCase());
}
