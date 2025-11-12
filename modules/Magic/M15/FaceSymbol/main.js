export default async function(card, utils) {
    const options = await utils.import('options.js');
    card.showFaceSymbol = true;
    card.faceSymbolStyle = {};

    async function loadFaceSymbol(symbolOption) {
        if (symbolOption.id !== 'autodetect')
            return await utils.assetURL(symbolOption.url);
        // TODO: autodetect logic
        return await utils.assetURL(options[1].url);
    }

    function findOption(options, id) {
        return options.find(opt => opt.id === id);
    }

    function resolveGroupOption(groupId, symbolId) {
        const group = findOption(options, groupId);
        if (!group || !group.items) return;
        return findOption(group.items, symbolId);
    }

    function resolveOption(symbolId) {
        const symbolParts = symbolId.split('/');
        return symbolParts.length > 1
            ? resolveGroupOption(symbolParts[0], symbolId)
            : findOption(options, symbolId);
    }

    function getFaceSymbolClass(option) {
        return option.id.replaceAll('_', '-').replaceAll('/', ' ');
    }

    Alpine.effect(async () => {
        if (card.faceSymbol === undefined) return;
        const selectedOption = resolveOption(card.faceSymbol) ||  options[1];
        card.faceSymbolUrl = await loadFaceSymbol(selectedOption);
        card.faceSymbolClass = getFaceSymbolClass(selectedOption);
    });

    card.addField({
        id: 'faceSymbol',
        type: 'select',
        options,
        displayName: 'Face Symbol',
        group: 'header'
    });

    card.publishElement('face-symbol',
        `<img :src="faceSymbolUrl" :class="faceSymbolClass" />`
    );

    card.addStyle(await utils.loadFile('style.css'));
}
