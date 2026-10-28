export function atomize(str) {
    let inQuote = false;
    let current = '';
    const atoms = [];
    for (const char of str) {
        const terminator = inQuote ? '"' : ' ';
        if (char === terminator) {
            if (current.length) atoms.push(current);
            current = '';
            inQuote = false;
            continue;
        }
        if (char === '"') {
            inQuote = !inQuote;
            continue;
        }
        current += char;
    }
    return atoms;
}

export function getProjectSubtypes() {
    const subtypes = {};

    const addSubtype = subtype => {
        subtypes[subtype] ||= 0;
        subtypes[subtype] += 1;
    };

    activeProject.cards.forEach(card => {
        const cardSubtypes = [
            ...(card.front?.subType || '').split(' '),
            ...(card.back?.subType || '').split(' '),
        ].filter(Boolean);
        cardSubtypes.forEach(addSubtype);
    });

    return subtypes;
}

export function getProjectTags() {
    const tags = {};

    const addTag = tag => {
        tags[tag] ||= 0;
        tags[tag] += 1;
    };

    activeProject.cards.forEach(card => {
        card.tags.forEach(addTag);
    });

    return tags;
}
