import makeSymbolOptions from './src/symbolOptions.js';
import { resolveOption, computeOption, getFaceSymbolClass } from './src/helpers.js';

const L = localize('module-M15-face-symbol');

export default class FaceSymbolModule extends CardMagicianModule {
    loadImage(opt) {
        opt.imageURL = this.resolveAsset(opt.imagePath);
    }

    loadFaceSymbolImages(options) {
        options.concat(options.flatMap(opt => opt.items || []))
            .filter(opt => Boolean(opt.imagePath))
            .map(opt => this.loadImage(opt));
    }

    async init(card) {
        this.faceSymbolField = {
            id: 'faceSymbol',
            type: 'select',
            label: L`Face Symbol`,
            options: makeSymbolOptions(),
            initialValue: 'autodetect',
            default: null
        };
        this.loadFaceSymbolImages(this.faceSymbolField.options);
    }

    updateFaceSymbol(card) {
        this.selectedFaceSymbol = resolveOption(
            this.faceSymbolField.options,
            card.faceSymbol
        );
        this.faceSymbolClass = getFaceSymbolClass(this.selectedFaceSymbol);
        this.requestRender();
    }

    updateAutoSymbols(card) {
        if (!card.parent) return;
        for (const option of this.faceSymbolField.options) {
            computeOption(card, option, this.faceSymbolField.options);
            if (!option.items) continue;
            for (const item of option.items)
                computeOption(card, item, option.items);
        }
        changed(this.faceSymbolField, 'options');
    }

    bind(card, watch) {
        watch(card, ['colorIdentity', 'superType', 'parent'],
            () => this.updateAutoSymbols(card)
        );
        watch(card, ['faceSymbol', 'parent'], () => this.updateFaceSymbol(card));
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
        return [this.faceSymbolField];
    }

    async styles() {
        return [await this.loadFile('style.css')];
    }
}
