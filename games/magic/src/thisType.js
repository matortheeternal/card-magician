const permanentTypeOrdering = [
    "creature",
    "planeswalker",
    "battle",
    "land",
    "artifact",
    "enchantment"
];

const thisTypeStrategies = [
    card => card.superType.match(/\binstant\b/i) || card.superType.match(/\sorcery\b/i) ? "spell" : false,
    card => card.subType.match(/\bvehicle\b/i)?.[0],
    card => card.subType.match(/\bspacecraft\b/i)?.[0],
    card => card.subType.match(/\bplanet\b/i)?.[0],
    card => card.subType.match(/\bcreature\b/i)?.[0],
    card => card.subType.match(/\bplaneswalker\b/i)?.[0],
    card => card.subType.match(/\bbattle\b/i)?.[0],
    card => card.subType.match(/\bland\b/i)?.[0],
    card => card.subType.match(/\bartifact\b/i)?.[0],
    card => card.subType.match(/\benchantment\b/i)?.[0],
    card => "permanent"
];

export function getThisType(card) {
    for (const strategy of thisTypeStrategies) {
        const res = strategy(card);
        if (res) return res;
    }
}