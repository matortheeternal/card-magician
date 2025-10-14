export default async function(card, utils) {
    card.addField({
        id: 'name',
        displayName: 'Name',
        group: 'header'
    });

    card.getLegendName = function() {
        if (!card.isLegendary()) return card.name;
        const match = card.name.match(/^(.+),|(.+) the/);
        return match ? match[1] || match[2] : card.name;
    };

    card.publishElement('name',
        `<span x-text="face.name" x-fit-text="{text: [face.name]}"></span>`
    );

    await utils.loadFont('Beleren Bold', 'beleren-bold_P1.01.ttf');
    card.addStyle(await utils.loadFile('style.css'));
}
