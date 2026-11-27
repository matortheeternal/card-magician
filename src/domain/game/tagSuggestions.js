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

function addSuggestions(groups, card) {
    for (const tag of suggestedTagsFor(card)) {
        if (!groups.has(tag)) groups.set(tag, []);
        groups.get(tag).push(card);
    }
}

export function groupTagSuggestions(cards) {
    const groups = new Map();
    for (const card of cards) addSuggestions(groups, card);
    return [...groups]
        .map(([tag, taggedCards]) => ({ tag, cards: taggedCards }))
        .sort((a, b) => b.cards.length - a.cards.length || a.tag.localeCompare(b.tag));
}

function editedTags(card, added) {
    const edit = window.activeGame?.editCardTags;
    return edit?.(card, added) ?? { tags: [...new Set([...card.tags ?? [], ...added])] };
}

function acceptedValues(card, accepted) {
    if (!accepted.length) return {};
    const { tags, ...metadata } = editedTags(card, accepted);
    const values = { tags };
    for (const [key, value] of Object.entries(metadata))
        if (value.length || Object.hasOwn(card, key)) values[key] = value;
    return values;
}

function declinedValues(card, declined) {
    if (!declined.length) return {};
    return { dismissedTags: [...new Set([...card.dismissedTags ?? [], ...declined])] };
}

function currentValues(card, keys) {
    return Object.fromEntries(keys.map(key => [key, card[key]]));
}

export function tagSuggestionChanges(decisions, { dismissDeclined = false } = {}) {
    const changes = [];
    for (const [card, { accepted, declined }] of decisions) {
        const newValues = {
            ...acceptedValues(card, accepted),
            ...declinedValues(card, dismissDeclined ? declined : [])
        };
        const keys = Object.keys(newValues);
        if (!keys.length) continue;
        changes.push({ card, oldValues: currentValues(card, keys), newValues });
    }
    return changes;
}
