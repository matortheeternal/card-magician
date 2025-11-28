export function findOption(options, id, includeNested = false) {
    for (const option of options) {
        if (option.id === id) return option;
        if (!includeNested || !option.items) continue;
        for (const subOption of option.items)
            if (subOption.id === id) return subOption;
    }
}

export function resolveGroupOption(options, groupId, symbolId) {
    const group = findOption(options, groupId);
    if (!group || !group.items) return;
    return findOption(group.items, symbolId);
}

export function resolveOption(options, symbolId) {
    if (!symbolId) return;
    const symbolParts = symbolId.split('/');
    return symbolParts.length > 1
        ? resolveGroupOption(options, symbolParts[0], symbolId)
        : findOption(options, symbolId, true);
}

export function getFaceSymbolClass(option) {
    if (!option) return '';
    const id = option.res ? option.res.id : option.id;
    return id.replaceAll('_', '-').replaceAll('/', ' ');
}

export function computeOption(card, option, optionsToSearch) {
    if (!option.compute) return;
    option.resolved = option.compute(card, optionsToSearch);
    if (option.resolved) option.imageURL = option.resolved.imageURL;
}
