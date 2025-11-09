const rarity = (name, id) => ({
    id: id || name.toLowerCase(),
    name
});

export default async function(card) {
    Alpine.effect(() => {
        if (!card.rarity) return;
        card.rarityCharacter = card.rarity.slice(0, 1);
        card.rarityClass = `rarity-${card.rarity.toLowerCase()}`;
    });

    card.addField({
        id: 'rarity',
        type: 'select',
        options: [
            rarity('Common'),
            rarity('Uncommon'),
            rarity('Rare'),
            rarity('Mythic Rare', 'mythic'),
        ],
        displayName: 'Rarity',
        group: 'footer',
        default: "Common",
    });

    card.publishElement('expansion-symbol',
        `<span :class="rarityClass" x-text="rarityCharacter"></span>`
    );
}
