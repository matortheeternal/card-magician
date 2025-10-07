export default async function(card, utils) {
    card.addField({
        id: 'cardName',
        displayName: 'Name'
    });

    card.getLegendName = function() {
        if (!card.isLegendary()) return card.cardName;
        const match = card.cardName.match(/^(.+),|(.+) the/);
        return match ? match[1] || match[2] : card.cardName;
    };

    card.publishElement('name',
        `<span x-text="cardName" x-fit-text="cardName"></span>`
    );

    await utils.loadFont('Beleren Bold', 'beleren-bold_P1.01.ttf');
    card.addStyle(await utils.loadFile('style.css'));
}
