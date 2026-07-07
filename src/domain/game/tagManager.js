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
