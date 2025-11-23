import options from './src/options.js';
import { resolveOption, computeOption, getFaceSymbolClass } from './src/helpers.js';

export default class FaceSymbolModule extends CardMagicianModule {
    loadImage(opt) {
        opt.imageURL = this.resolveAsset(opt.imagePath);
    }

    loadFaceSymbolImages() {
        this.options
            .concat(this.options.flatMap(opt => opt.items || []))
            .filter(opt => Boolean(opt.imagePath))
            .map(opt => this.loadImage(opt))
    }

    async init() {
        this.options = this.makeReactive(options);
        this.loadFaceSymbolImages();
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
