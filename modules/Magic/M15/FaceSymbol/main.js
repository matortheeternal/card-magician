import makeSymbolOptions from './src/symbolOptions.js';
import { resolveOption, computeOption, getFaceSymbolClass } from './src/helpers.js';

export default class FaceSymbolModule extends CardMagicianModule {
    loadImage(opt) {
        opt.imageURL = this.resolveAsset(opt.imagePath);
    }

    loadFaceSymbolImages() {
        this.symbolOptions
            .concat(this.symbolOptions.flatMap(opt => opt.items || []))
            .filter(opt => Boolean(opt.imagePath))
            .map(opt => this.loadImage(opt))
    }

    async init(card) {
        this.symbolOptions = this.makeReactive(makeSymbolOptions());
        this.loadFaceSymbolImages();
    }

    updateFaceSymbol(card) {
        this.selectedFaceSymbol = resolveOption(this.symbolOptions, card.faceSymbol);
        this.faceSymbolClass = getFaceSymbolClass(this.selectedFaceSymbol);
        this.requestRender();
    }

    updateAutoSymbols(card) {
        if (!card.parent) return;
        for (const option of this.symbolOptions) {
            computeOption(card, option, this.symbolOptions);
            if (!option.items) continue;
            for (const item of option.items)
                computeOption(card, item, option.items);
        }
    }

    bind(card, watch) {
        watch(() => [card.colorIdentity, card.superType, card.parent],
              () => this.updateAutoSymbols(card));
        watch(() => [card.faceSymbol, card.parent],
              () => this.updateFaceSymbol(card));
    }

    render(card) {
        if (!card.faceSymbol) return;
        const src = this.selectedFaceSymbol?.imageURL;
        if (!src) return '';
        return (
            `<img src="${src}" class="${this.faceSymbolClass}"/>`
        );
    }

    get fields() {
        return [{
            id: 'faceSymbol',
            type: 'select',
            label: 'Face Symbol',
            options: this.symbolOptions,
            initialValue: 'autodetect',
            default: null
        }];
    }

    async styles() {
        return [await this.loadFile('style.css')];
    }
}
