import { findTag } from './tagManager.js';

function canonicalTag(tag) {
    return window.activeGame?.tagRelationships?.canonicalTag(tag) ?? tag;
}

function excludedTags(card) {
    const tags = [
        ...card.tags ?? [],
        ...card.dismissedTags ?? [],
        ...card.excludedInheritedTags ?? []
    ];
    return new Set(tags.map(canonicalTag));
}

export function suggestedTagsFor(card) {
    const assistance = window.activeGame?.oracleAssistance;
    if (!assistance) return [];
    const excluded = excludedTags(card);
    const available = assistance.suggestTags(card).map(canonicalTag)
        .filter(tag => !excluded.has(tag) && !findTag(tag)?.hidden);
    return window.activeGame.tagRelationships?.specificTags(available) ?? available;
}
