import { manageCollection } from '../../shared/storageUtils.js';
import * as fuzzySort from 'fuzzysort';

export const tagManager = manageCollection({
    path: () => [appEnvironment.paths.data, activeGame.id, 'tags.yml'],
    matches: (tag, text) => tag.text === text,
    create: text => ({ text, variant: 'neutral' })
});

export function getTags() {
    return tagManager.collection;
}

export function findTag(text) {
    return tagManager.find(text);
}

export function findOrCreateTag(text) {
    return tagManager.findOrCreate(text);
}

export function deleteTag(tag) {
    return tagManager.removeAll(tag.text);
}

export function searchTags(value, limit = 8) {
    if (!value.trim().length) return [];
    return fuzzySort.go(value, tagManager.collection, {
        key: 'text',
        limit
    }).map(r => r.obj);
}
