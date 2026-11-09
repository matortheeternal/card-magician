import * as cardTypes from './cardTraits/cardTypes.js';

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
    return cardTypes.isArtifact(card.front);
}

export function isLand(card) {
    return cardTypes.isLand(card.front);
}

export function isBasicLand(card) {
    return cardTypes.isBasicLand(card.front);
}

export function isMulticolor(card) {
    return  !isLand(card)
        && card.front.colors?.length
        && card.front.colors.length > 1;
}

export function isToken(card) {
    return cardTypes.isToken(card.front);
}

export function isEmblem(card) {
    return cardTypes.isEmblem(card.front);
}

export function isCreature(card) {
    return cardTypes.isCreature(card.front);
}
