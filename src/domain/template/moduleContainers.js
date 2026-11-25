function containerSelector(name, subcardKey) {
    const subcard = subcardKey ? `[subcard="${subcardKey}"]` : ':not([subcard])';
    return `module-container[module="${name}"]${subcard}`;
}

function findContainerName(module, card, claimedNames) {
    const root = card.renderRoot;
    for (const name of module.constructor.containerNames) {
        if (name !== module.name && claimedNames.has(name)) continue;
        if (root.querySelector(containerSelector(name, card.subcardKey))) return name;
    }
    return module.name;
}

export function resolveContainerNames(card) {
    const claimedNames = new Set(card.modules.map(module => module.name));
    for (const module of card.modules) {
        module.containerName = findContainerName(module, card, claimedNames);
        claimedNames.add(module.containerName);
    }
}
