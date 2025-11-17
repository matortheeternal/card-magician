export function findOption(options, id, includeNested = false) {
    for (const option of options) {
        if (option.id === id) return option;
        if (!includeNested || !option.items) continue;
        for (const subOption of option.items)
            if (subOption.id === id) return subOption;
    }
}

export function resolveGroupOption(options, groupId, symbolId) {
    const group = findOption(options, groupId);
    if (!group || !group.items) return;
    return findOption(group.items, symbolId);
}

export function resolveOption(options, symbolId) {
    const symbolParts = symbolId.split('/');
    return symbolParts.length > 1
        ? resolveGroupOption(options, symbolParts[0], symbolId)
        : findOption(options, symbolId, true);
}

export function getFaceSymbolClass(option) {
    const id = option.res ? option.res.id : option.id;
    return id.replaceAll('_', '-').replaceAll('/', ' ');
}

function computeOption(card, option, optionsToSearch) {
    if (!option.compute) return;
    option.resolved = option.compute(card, optionsToSearch);
    if (option.resolved) option.imageURL = option.resolved.imageURL;
}

export default class FaceSymbolModule extends CardMagicianModule {
    loadImage(opt) {
        return this.assetURL(opt.imagePath).then(imageURL => {
            opt.imageURL = imageURL;
        });
    }

    loadFaceSymbolImages() {
        return Promise.all(
            this.options
                .concat(this.options.flatMap(opt => opt.items || []))
                .filter(opt => Boolean(opt.imagePath))
                .map(opt => this.loadImage(opt))
        );
    }

    async init() {
        this.options = this.makeReactive(await this.import('options.js'));
        this.options[0].compute = await this.import('autodetect.js');
        await this.loadFaceSymbolImages();
    }

    renderFaceSymbol(card) {
        this.selectedFaceSymbol = resolveOption(this.options, card.faceSymbol)
            || this.options[1];
        this.faceSymbolClass = getFaceSymbolClass(this.selectedFaceSymbol);
        this.requestRender();
    }

    updateAutoSymbols(card) {
        if (!card.parent) return;
        for (const option of this.options) {
            computeOption(card, option, this.options);
            if (!option.items) continue;
            for (const item of option.items)
                computeOption(card, item, option.items);
        }

    }

    bind(card, watch) {
        watch(() => [card.colorIdentity, card.superType, card.parent],
              () => this.updateAutoSymbols(card));
        watch(() => [card.faceSymbol, card.parent],
              () => this.renderFaceSymbol(card));
    }

    render(card) {
        if (!card.parent || !card.parent().back) return;
        const src = this.selectedFaceSymbol.imageURL;
        if (!src) return '';
        return (
            `<img src="${src}" class="${this.faceSymbolClass}"/>`
        );
    }

    get fields() {
        return [{
            id: 'faceSymbol',
            type: 'select',
            displayName: 'Face Symbol',
            options: this.options,
            default: 'autodetect'
        }];
    }

    async styles() {
        return [await this.loadFile('style.css')];
    }
}
