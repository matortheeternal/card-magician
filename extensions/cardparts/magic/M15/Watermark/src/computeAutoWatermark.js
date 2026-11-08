function resolveOption(card, options, id) {
    for (const option of options) {
        if (option.id === id) return option;
        if (!option.items) continue;
        const item = option.items.find(item => item.id === id);
        if (item) return item;
    }
}

export default function computeAutoWatermark(card, options) {
    const colors = Object.keys(card.colorIdentity.getColorsFromSources());
    if (colors.length !== 1) return;
    return resolveOption(card, options, `mana/${colors[0]}`);
}
