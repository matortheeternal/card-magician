const rarities = ['common', 'uncommon', 'rare', 'mythic'];

function getRarity(card, face = 'front') {
    return card.original[face]?.rarity;
}

function compareRarities(aRarity, bRarity) {
    if (!aRarity && !bRarity) return 0;
    if (!aRarity) return -1;
    if (!bRarity) return 1;
    const aIndex = (rarities.indexOf(aRarity) + 1) || 10;
    const bIndex = (rarities.indexOf(bRarity) + 1) || 10;
    if (aIndex > bIndex) return 1;
    if (aIndex < bIndex) return -1;
    return 0;
}

export default function compareRowRarity(a, b) {
    const aFront = getRarity(a);
    const bFront = getRarity(b);
    return compareRarities(aFront, bFront);
}
