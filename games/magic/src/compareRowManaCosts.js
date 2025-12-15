function getManaCost(card, face) {
    return card.original[face]?.manaCost;
}

function compareManaCostValues(aCost, bCost) {
    if (!aCost && !bCost) return 0;
    if (!aCost) return -1;
    if (!bCost) return 1;
    if (aCost.cmc > bCost.cmc) return 1;
    if (aCost.cmc < bCost.cmc) return -1;
    if (aCost.toString() > bCost.toString()) return 1;
    if (aCost.toString() < bCost.toString()) return -1;
    return 0;
}

export default function compareRowManaCosts(a, b) {
    const aFront = getManaCost(a, 'front');
    const bFront = getManaCost(b, 'front');
    const frontCmp = compareManaCostValues(aFront, bFront);

    if (frontCmp !== 0) return frontCmp;
    const aBack = getManaCost(a, 'back');
    const bBack = getManaCost(b, 'back');
    return compareManaCostValues(aBack, bBack);
}
