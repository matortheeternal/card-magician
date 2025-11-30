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
    const indexA = getSortIndex(a);
    const indexB = getSortIndex(b); 

    if (indexA === indexB) {
        return a.front.name > b.front.name ? 1 : -1;
    }

    return indexA - indexB;
}

function isColorless(card) {
    return  card.front.colors?.length === 0 && !card.front.superType?.includes("Artifact") && !card.front.superType?.includes("Land");
}

function isUninitializedCard(card) {
    return Object.keys(card.front).length < 2;
}

function isMonoColor(card, color) {
    return card.front.colors?.length === 1 && card.front.colors?.[0].name === color;
}

function isArtifact(card) {  
  return /\bArtifact\b/i.test(card.front.superType || ''); 
}

function isLand(card) {  
  return /\bLand\b/i.test(card.front.superType || ''); 
}  

function isBasic(card) {  
  return /\bBasic\b/i.test(card.front.superType || ''); 
}

const numberingRules = [
    (card) => isUninitializedCard(card) || isColorless(card),
    (card) => isMonoColor(card, "white"),
    (card) => isMonoColor(card, "blue"),
    (card) => isMonoColor(card, "black"),
    (card) => isMonoColor(card, "red"),
    (card) => isMonoColor(card, "green"),
    (card) => card.front.colors?.length > 1,
    (card) => isArtifact(card) && !isLand(card),
    (card) => isLand(card) && !isBasic(card),
    (card) => isBasic(card),
    (card) => true
];

function getSortIndex(card) {
    return numberingRules.findIndex(rule => rule(card));
}