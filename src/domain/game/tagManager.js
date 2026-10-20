import fuzzysort from 'fuzzysort';

const tags = [];
let projectTags = [];

export function getTags() {
    return projectTags;
}

export function loadTags(tags) {
    projectTags = tags.sort((a, b) => {
        if (a.text > b.text) return 1;
        if (a.text < b.text) return -1;
        return 0;
    });
}

export function findTag(text) {
    return tags.find(tag => tag.text === text)
        || projectTags.find(tag => tag.text === text);
}

export function findOrCreateTag(text) {
    const existingTag = findTag(text);
    if (existingTag) return existingTag;
    const newTag = {
        text,
        variant: 'neutral'
    };
    projectTags.push(newTag);
    return newTag;
}

export function deleteTag(tag) {
    projectTags = projectTags.filter(t => t.text !== tag.text);
}

export function searchTags(value, limit = 8) {
    if (!value.trim().length) return [];
    return fuzzysort.go(value, tags.concat(projectTags), {
        key: 'text',
        limit
    }).map(r => r.obj);
}
