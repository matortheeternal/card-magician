import { manageCollection } from '../../shared/storageUtils.js';
import * as fuzzySort from 'fuzzysort';
import { normalizeTagStyle } from './tagStyles.js';

export const tagManager = manageCollection({
    path: () => [appEnvironment.paths.data, activeGame.id, 'tags.yml'],
    matches: (tag, text) => tag.text === text,
    create: text => ({ text })
});

export function findTag(text) {
    return tagManager.find(text);
}

export function defaultTagStyle(text) {
    return window.activeGame?.oracleAssistance?.defaultTagStyle(text);
}

export function tagStyle(text) {
    return normalizeTagStyle(findTag(text)?.variant ?? defaultTagStyle(text));
}

export function getTags() {
    const tags = new Map();
    const defaults = window.activeGame?.oracleAssistance?.defaultTagStyles ?? [];
    for (const [text, variant] of defaults) tags.set(text, { text, variant });
    for (const tag of tagManager.collection) tags.set(tag.text, tag);
    return [...tags.values()].filter(tag => !tag.hidden);
}

function saveTags() {
    changed(tagManager, 'tags');
    tagManager.scheduleSave();
}

export function findOrCreateTag(text) {
    const tag = tagManager.findOrCreate(text);
    if (!tag.hidden) return tag;
    delete tag.hidden;
    saveTags();
    return tag;
}

export function rememberTag(text) {
    const defaults = window.activeGame?.oracleAssistance?.defaultTagStyles;
    if (defaults?.has(text) || findTag(text)) return;
    tagManager.create(text);
}

export function setTagStyle(text, variant) {
    const tag = tagManager.findOrCreate(text);
    tag.variant = variant;
    saveTags();
}

export function hideTag(text) {
    const tag = tagManager.findOrCreate(text);
    tag.hidden = true;
    saveTags();
}

export function searchTags(value, limit = 8) {
    if (!value.trim().length) return [];
    return fuzzySort.go(value, getTags(), {
        key: 'text',
        limit
    }).map(r => r.obj);
}
