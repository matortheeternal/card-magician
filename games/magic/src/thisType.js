const permanentTypeOrdering = [
    "Creature",
    "Planeswalker",
    "Battle",
    "Land",
    "Artifact",
    "Enchantment"
];

export function thisType(card) {
    if (card.subType.includes("Vehicle")) return "Vehicle";
    if (card.subType.includes("Spacecraft")) return "Spacecraft";
    if (card.subType.includes("Planet")) return "Planet";

    if (card.superType.includes("Instant") || card.superType.includes("Sorcery")) return "spell";

    for (const type of permanentTypeOrdering) {
        if (card.superType.includes(type)) return type;
    }

    return "permanent";
}