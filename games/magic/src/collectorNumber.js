export function autoNumberCards(set) {
    const sorted_cards = set.cards.slice().sort(collectorNumberSort);

    for (const [ i, card ] of sorted_cards.entries()) {
        const set_card = set.cards[set.cards.indexOf(card)];
        set_card.front.autoCollectorNumber = formatCollectorNumber(set, i + 1);
    }
}

function formatCollectorNumber(set, n) {
    n = n || 0;

    const strN = n.toString();
    switch (set.info.collectorNumberFormat) {
        case 'four':
            return strN.padStart(4, '0');
        case 'threeOutOf':
            return strN.padStart(3, '0') + '/' + set.cards.length.toString().padStart(3, '0');
        default:
            return strN;
    }
}

function collectorNumberSort(a, b) {
    if (getColorIndex(a) == getColorIndex(b)) {
        return a.front.name > b.front.name ? 1 : -1;
    }

    return getColorIndex(a) - getColorIndex(b);
}


const numberingRules = [
    (card) => Object.keys(card.front).length < 2 || (card.front.colors.length == 0 && !card.front.superType.includes("Artifact")),
    (card) => card.front.colors.length == 1 && card.front.colors[0].name == "white",
    (card) => card.front.colors.length == 1 && card.front.colors[0].name == "blue",
    (card) => card.front.colors.length == 1 && card.front.colors[0].name == "black",
    (card) => card.front.colors.length == 1 && card.front.colors[0].name == "red",
    (card) => card.front.colors.length == 1 && card.front.colors[0].name == "green",
    (card) => card.front.colors.length > 1,
    (card) => card.front.superType.includes("Artifact") && !card.front.superType.includes("Land"),
    (card) => card.front.superType.includes("Land") && !card.front.superType.includes("Basic Land"),
    (card) => card.front.superType.includes("Basic Land"),
    (card) => true
];

function getColorIndex(card) {
    return numberingRules.findIndex(rule => rule(card));
}