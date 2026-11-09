import { matchLevels, matchStation, matchChoices } from './textStructures.js';

const COMPANION_PATTERN = /^companion\b/i;
const MIRACLE_PATTERN = /\bmiracle\b/i;
const MUTATE_PATTERN = /^mutate\b/i;
const TRANSFORM_PATTERN = /\bTransform(ed)?\b/i;
const DAYBOUND_PATTERN = /\bDaybound\b/i;
const DISTURB_PATTERN = /\bDisturb\b/i;
const MORE_THAN_MEETS_THE_EYE_PATTERN = /\bMore Than Meets the Eye\b/i;

export function isCompanion(face) {
    return COMPANION_PATTERN.test(face.rulesText ?? '');
}

export function isMiracle(face) {
    return MIRACLE_PATTERN.test(face.rulesText ?? '');
}

export function isMutate(face) {
    return MUTATE_PATTERN.test(face.rulesText ?? '');
}

export function hasLevels(face) {
    return Boolean(matchLevels(face.rulesText ?? ''));
}

export function isStation(face) {
    return Boolean(matchStation(face.rulesText ?? ''));
}

export function hasChoices(face) {
    return Boolean(matchChoices(face.rulesText ?? ''));
}

export function hasNoText(face) {
    return !face.rulesText?.length && !face.flavorText?.length;
}

export function isTransform(face) {
    return TRANSFORM_PATTERN.test(face.rulesText ?? '')
        || DAYBOUND_PATTERN.test(face.rulesText ?? '')
        || DISTURB_PATTERN.test(face.rulesText ?? '')
        || MORE_THAN_MEETS_THE_EYE_PATTERN.test(face.rulesText ?? '');
}
