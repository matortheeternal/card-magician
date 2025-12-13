const permanentTypeOrdering = [
    "creature",
    "planeswalker",
    "battle",
    "land",
    "artifact",
    "enchantment"
];

export function thisType(card) {
    if (card.subType.includes("Vehicle")) return "Vehicle";
    if (card.subType.includes("Spacecraft")) return "Spacecraft";
    if (card.subType.includes("Planet")) return "Planet";

    if (card.superType.includes("Instant") || card.superType.includes("Sorcery")) return "spell";

    for (const type of permanentTypeOrdering) {
        if (card.superType.toLowerCase().includes(type)) return type;
    }

    return "permanent";
}