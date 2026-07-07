import fuzzysort from 'fuzzysort';

const tags = [];

export function getTags() {
    return tags.slice();
}

export function findOrCreateTag(text) {
    const existingTag = tags.find(tag => tag.text === text);
    if (existingTag) return existingTag;
    const newTag = {
        text,
        variant: 'neutral'
    };
    tags.push(newTag);
    return newTag;
}

export function searchTags(value) {
    if (!value.trim().length) return [];
    return fuzzysort.go(value, tags, {
        key: 'text',
        limit: 20
    }).map(r => r.obj);
}
