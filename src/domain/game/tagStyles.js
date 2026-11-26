const L = localize('tag-styles');

export const tagStyles = [
    { id: 'neutral', label: L`Generic` },
    { id: 'ivory', label: L`White` },
    { id: 'blue', label: L`Blue` },
    { id: 'violet', label: L`Black` },
    { id: 'red', label: L`Red` },
    { id: 'green', label: L`Green` },
    { id: 'teal', label: L`Notable` },
    { id: 'amber', label: L`High-impact` },
    { id: 'pink', label: L`Watchlist` }
];

const legacyVariants = new Map([
    ['primary', 'blue'],
    ['success', 'green'],
    ['warning', 'amber'],
    ['danger', 'red']
]);
const styleIds = new Set(tagStyles.map(({ id }) => id));

export function normalizeTagStyle(style) {
    if (styleIds.has(style)) return style;
    return legacyVariants.get(style) ?? 'neutral';
}
