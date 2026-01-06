const tags = [{
    id: 'wip',
    name: 'Work in progress'
}, {
    id: 'removal',
    name: 'Removal'
}, {
    id: 'bomb',
    name: 'Bomb'
}];

export function getTags() {
    return tags.slice();
}

export function addTag(id, name) {
    if (tags.some(tag => tag.id === id))
        throw new Error(`tag id ${id} already used`);
    tags.push({id, name});
}
