import makeSymbolOptions from './src/symbolOptions.js';
import { getFaceSymbolClass } from './src/helpers.js';

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
        this.faceSymbolClass = getFaceSymbolClass(card.faceSymbol);
        this.requestRender();
    }

    bind(card, watch) {
        watch(card, ['colorIdentity', 'superType', 'parent'],
              () => changed(this.faceSymbolField, '')
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
