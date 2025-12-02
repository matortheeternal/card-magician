import {
    isUninitializedCard, isColorless, isMonoColor,
    isMulticolor, isArtifact, isLand, isBasicLand
} from './helpers.js';

export const numberingRules = [
    card => isUninitializedCard(card) || isColorless(card),
    card => isMonoColor(card, 'white'),
    card => isMonoColor(card, 'blue'),
    card => isMonoColor(card, 'black'),
    card => isMonoColor(card, 'red'),
    card => isMonoColor(card, 'green'),
    card => isMulticolor(card),
    card => isArtifact(card) && !isLand(card),
    card => isLand(card) && !isBasicLand(card),
    card => isBasicLand(card),
    () => true
];

export function getSortIndex(card) {
    return numberingRules.findIndex(rule => rule(card));
}

export function collectorNumberSort(a, b) {
    return getSortIndex(a) - getSortIndex(b)
        || (a.front.name || '').localeCompare(b.front.name || '');
}

export function formatCollectorNumber(set, num, suffix = '') {
    if (set.info.collectorNumberFormat === 'four')
        return num.toString().padStart(4, '0') + suffix;
    if (set.info.collectorNumberFormat === 'threeOutOf') {
        const current = num.toString().padStart(3, '0') + suffix;
        const max = set.cards.length.toString().padStart(3, '0');
        return `${current} / ${max}`;
    }
    return num.toString() + suffix;
}

export function setAutoNumber(set, card, num) {
    const hasBack = Object.hasOwn(card, 'back');
    const frontSuffix = hasBack ? 'a' : '';
    card.front.autoCollectorNumber = formatCollectorNumber(set, num, frontSuffix);
    if (!hasBack) return;
    card.back.autoCollectorNumber = formatCollectorNumber(set, num, 'b');
}

export function autoNumberCards(set) {
    const sortedCards = set.cards.slice().sort(collectorNumberSort);
    for (const [i, card] of sortedCards.entries())
        setAutoNumber(set, card, i + 1);
}
