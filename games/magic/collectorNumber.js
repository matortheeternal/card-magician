export function autoNumberCards(set) {
    const sorted_cards = set.cards.slice().sort(collectorNumberSort);

    for (const [ i, card ] of sorted_cards.entries()) {
        const set_card = set.cards[set.cards.indexOf(card)];
        set_card.front.autoCollectorNumber = i;
    }
}

const color_indexes = {
    colorless: 0,
    white: 1,
    blue: 2,
    black: 3,
    red: 4,
    green: 5,
    multicolor: 6,
    artifact: 7,
    land: 8,
    basic_land: 9,
    other: 10
};

function collectorNumberSort(a, b) {
    if (getColorIndex(a) == getColorIndex(b)) {
        return a < b ? 1 : -1;
    }

    return getColorIndex(a) - getColorIndex(b);
}

function getColorIndex(card) {
    const num_keys = Object.keys(card.front).length;
    
    if (num_keys < 2) { // autoCollectorNumber is being set for whatever reason, this just checks if the card is empty
        return color_indexes.colorless;
    }

    if (card.front.superType.includes("Basic Land")) {
        return color_indexes.basic_land;
    }

    if (card.front.superType.includes("Land")) {
        return color_indexes.land;
    }

    if (card.front.colors.length == 0 && !card.front.superType.includes("Artifact")) {
        return color_indexes.colorless;
    }

    if (card.front.colors.length == 0 && card.front.superType.includes("Artifact")) {
        return color_indexes.artifact;
    }
    
    if (card.front.colors.length > 1) {
        return color_indexes.multicolor;
    }

    const card_color = card.front.colors[0];
    const color_index = color_indexes[card_color.name];

    return color_index || color_indexes.other;
}