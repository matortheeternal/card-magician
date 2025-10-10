export default async function(card, utils) {
    const { ColorIdentity } = await utils.import('ColorIdentity.js');
    card.colorIdentity = new ColorIdentity();

    Alpine.effect(async () => {
        if (card.manaCost === undefined) return;
        card.manaCostSymbols = card.parseSymbols(card.manaCost);
        card.colorIdentity.addColorSource('card', card.manaCostSymbols);
        card.manaCostHTML = await card.symbolsToHTML(card.manaCostSymbols, true);
    });

    card.getCardColorKey = function() {
        const colors = card.colorIdentity.colors;
        if (colors.length === 0)
            return card.superType.includes('Artifact') ? 'a' : 'c';
        if (colors.length === 1)
            return colors[0].char;
        return 'm';
    };

    card.addField({
        id: 'manaCost',
        displayName: 'Mana Cost',
        group: 'header'
    });

    card.publishElement('mana-cost',
        `<span x-html="manaCostHTML"></span>`
    );

    card.addStyle(await utils.loadFile('style.css'));
}
