export default async function(card, utils) {
    const options = await utils.import('options.js');
    options[0].compute = await utils.import('autodetect.js');
    card.showFaceSymbol = true;
    card.faceSymbolStyle = {};
    await loadFaceSymbolImages();

    function loadImage(opt) {
        return utils.assetURL(opt.imagePath).then(imageURL => {
            opt.imageURL = imageURL;
        });
    }

    function loadFaceSymbolImages() {
        return Promise.all(
            options
                .concat(options.flatMap(opt => opt.items || []))
                .filter(opt => Boolean(opt.imagePath))
                .map(opt => loadImage(opt))
        );
    }

    function findOption(options, id, includeNested = false) {
        for (const option of options) {
            if (option.id === id) return option;
            if (!includeNested || !option.items) continue;
            for (const subOption of option.items)
                if (subOption.id === id) return subOption;
        }
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
            : findOption(options, symbolId, true);
    }

    function getFaceSymbolClass(option) {
        return option.id.replaceAll('_', '-').replaceAll('/', ' ');
    }

    function renderFaceSymbol() {
        if (!utils.subscribe(card.faceSymbol)) return;
        const selectedOption = resolveOption(card.faceSymbol) ||  options[1];
        card.faceSymbolUrl = selectedOption.imageURL;
        card.faceSymbolClass = getFaceSymbolClass(selectedOption);
    }

    function computeOption(option, optionsToSearch) {
        if (!option.compute) return;
        const res = option.compute(card, optionsToSearch);
        if (res) option.imageURL = res.imageURL;
    }

    function updateAutoSymbols() {
        if (!utils.subscribe(
            card.faceSymbol, card.parent, card.colorIdentity, card.superType
        )) return;
        console.log('%cupdateAutoSymbols, ', 'color:red', card.id, card.parent());
        for (const option of options) {
            computeOption(option, options);
            if (!option.items) continue;
            for (const item of option.items)
                computeOption(item, option.items);
        }
    }

    Alpine.effect(renderFaceSymbol);
    Alpine.effect(updateAutoSymbols);

    card.addField({
        id: 'faceSymbol',
        type: 'select',
        options,
        displayName: 'Face Symbol'
    });

    card.publishElement('face-symbol',
        `<img :src="faceSymbolUrl" :class="faceSymbolClass" />`
    );

    card.addStyle(await utils.loadFile('style.css'));
}
