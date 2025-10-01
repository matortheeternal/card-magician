export default async function(card) {
    card.rarity = 'Common';
    card.rarityCharacter = 'C';
    card.rarityClass = 'rarity-common';

    card.rarityChanged = function() {
        card.rarityCharacter = card.rarity.slice(0, 1);
        card.rarityClass = `rarity-${card.rarity.toLowerCase()}`;
    };

    card.addField({
        id: 'rarity',
        type: 'select',
        options: ['Common', 'Uncommon', 'Rare', 'Mythic Rare'],
        displayName: 'Rarity',
        onChange: 'rarityChanged()'
    });

    card.publishElement('.card-expansion-symbol',
        `<span :class="rarityClass" x-text="rarityCharacter"></span>`
    );
}
