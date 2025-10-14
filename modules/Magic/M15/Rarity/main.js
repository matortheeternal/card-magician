export default async function(card) {
    Alpine.effect(() => {
        if (!card.rarity) return;
        card.rarityCharacter = card.rarity.slice(0, 1);
        card.rarityClass = `rarity-${card.rarity.toLowerCase()}`;
    });

    card.addField({
        id: 'rarity',
        type: 'select',
        options: ['Common', 'Uncommon', 'Rare', 'Mythic'],
        displayName: 'Rarity',
        group: 'footer',
        default: "Common",
    });

    card.publishElement('expansion-symbol',
        `<span :class="face.rarityClass" x-text="face.rarityCharacter"></span>`
    );
}
