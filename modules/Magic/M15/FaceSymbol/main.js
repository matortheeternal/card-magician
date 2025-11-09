export default async function(card, utils) {
    const options = await utils.import('options.js');
    card.showFaceSymbol = true;

    Alpine.effect(async () => {
        if (card.faceSymbol === undefined) return;
        const selectedOption = options.find(opt => {
            return opt.id === card.faceSymbol;
        });
        card.faceSymbolUrl = await utils.assetURL(selectedOption.url);
    });

    card.addField({
        id: 'faceSymbol',
        type: 'select',
        options,
        displayName: 'Face Symbol',
        group: 'header'
    });

    card.publishElement('face-symbol',
        `<img x-src="faceSymbolUrl" />`
    );
}
