export function autoNumberCards(set) {
    return set.sort(collectorNumberSort);
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
        return a > b;
    } else {
        return getColorIndex(a) - getColorIndex(b);
    }
}

function getColorIndex(card) {
    const card_model = card.model.front;

    if (card_model.superType.includes("Basic Land")) {
        return color_indexes.basic_land;
    }

    if (card_model.superType.includes("Land")) {
        return color_indexes.land;
    }

    if (card_model.colors.length == 0 && !card_model.superType.includes("Artifact")) {
        return color_indexes.colorless;
    }

    if (card_model.colors.length == 0 && card_model.superType.includes("Artifact")) {
        return color_indexes.artifact;
    }
    
    if (card_model.colors.length > 1) {
        return color_indexes.multicolor;
    }

    const card_color = card_model.colors[0];
    const color_index = color_indexes[card_color.name];

    return color_index || color_indexes.other;
}