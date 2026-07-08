import fuzzysort from 'fuzzysort';

const tags = [];
let projectTags = [];

export function getTags() {
    return projectTags.sort((a, b) => {
        if (a.text > b.text) return 1;
        if (a.text < b.text) return -1;
        return 0;
    });
}

export function loadTags(tags) {
    projectTags = tags;
}

export function findOrCreateTag(text) {
    const existingTag = tags.find(tag => tag.text === text)
        || projectTags.find(tag => tag.text === text);
    if (existingTag) return existingTag;
    const newTag = {
        text,
        variant: 'neutral'
    };
    projectTags.push(newTag);
    return newTag;
}

export function deleteTag(tag) {
    projectTags.remove(tag);
}

export function searchTags(value, limit = 8) {
    if (!value.trim().length) return [];
    return fuzzysort.go(value, tags.concat(projectTags), {
        key: 'text',
        limit
    }).map(r => r.obj);
}
