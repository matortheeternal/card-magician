import {
    isUninitializedCard, isColorless, isMonoColor,
    isMulticolor, isArtifact, isLand, isBasicLand, isCreature
} from './helpers.js';

const mainRarities = [
    'common', 'uncommon', 'rare', 'mythic', 'land'
];

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

export function formatCollectorNumber(project, num, suffix = '') {
    if (project.collectorNumberFormat === 'static')
        return 'TEST';
    if (project.collectorNumberFormat === 'four')
        return num.toString().padStart(4, '0') + suffix;
    if (project.collectorNumberFormat === 'threeOutOf') {
        const current = num.toString().padStart(3, '0') + suffix;
        const max = project.cards.length.toString().padStart(3, '0');
        return `${current} / ${max}`;
    }
    return num.toString() + suffix;
}

function assignAutoNumber(card, faceKey, value) {
    const face = card[faceKey];
    if (face.autoCollectorNumber === value) return;
    face.autoCollectorNumber = value;
    changed(card, `${faceKey}.autoCollectorNumber`);
}

export function setAutoNumber(project, card, num) {
    const hasBack = Object.hasOwn(card, 'back');
    const frontSuffix = hasBack ? 'a' : '';
    assignAutoNumber(card, 'front', formatCollectorNumber(project, num, frontSuffix));
    if (!hasBack) return;
    assignAutoNumber(card, 'back', formatCollectorNumber(project, num, 'b'));
}

function sortAndNumber(project, cards) {
    if (!cards) return;
    const sortedCards = cards.sort(collectorNumberSort);
    for (const [i, card] of sortedCards.entries())
        setAutoNumber(project, card, i + 1);
}

function cardCodeSort(a, b) {
    const aCreature = isCreature(a);
    const bCreature = isCreature(b);
    if (aCreature && !bCreature) return -1;
    if (!aCreature && bCreature) return 1;
    const acmc = parseInt(a.front?.manaCost?.cmc) || 0;
    const bcmc = parseInt(b.front?.manaCost?.cmc) || 0;
    return acmc - bcmc;
}

function getCardCodeCategory(card) {
    if (isLand(card)) return 'L';
    if (isArtifact(card) && !card.front.colors?.length) return 'A';
    if (isColorless(card)) return 'C';
    if (isMulticolor(card)) return 'Z';
    try {
        return card.front.colors[0].char.toUpperCase();
    } catch {
        return '?';
    }
}

function getCardCodeGroup(card) {
    const rarity = card?.front?.rarity || 'common';
    const prefix = rarity.slice(0, 1).toUpperCase();
    if (!mainRarities.includes(rarity)) return prefix;
    if (isBasicLand(card)) return 'L';
    return prefix + getCardCodeCategory(card);
}

function assignCardCode(key, card, index) {
    assignAutoNumber(card, 'front', key + index.toString().padStart(2, '0'));
}

function applyCardCodes(project) {
    const groups = Object.groupBy(project.cards, getCardCodeGroup);
    for (const [key, value] of Object.entries(groups)) {
        value.sort(cardCodeSort);
        for (let i = 0; i < value.length; i++)
            assignCardCode(key, value[i], i + 1);
    }
}

function applyCollectorNumbers(project) {
    const groups = Object.groupBy(project.cards, card => {
        const rarity = card.front?.rarity || 'common';
        return mainRarities.includes(rarity) ? 'extra' : 'main';
    });
    sortAndNumber(project, groups.main);
    sortAndNumber(project, groups.extra);
}

export function autoNumberCards(project) {
    const numberFn = project.collectorNumberFormat === 'cardCodes'
        ? applyCardCodes
        : applyCollectorNumbers;
    numberFn(project);
}
