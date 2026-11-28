import { canonicalTag } from 'oracle-of-pie';

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
        const tags = new Set((card.tags ?? []).map(canonicalTag));
        tags.forEach(addTag);
    });

    return tags;
}
