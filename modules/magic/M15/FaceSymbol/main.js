import makeSymbolOptions from './src/symbolOptions.js';
import { getFaceSymbolClass, resolveOption } from './src/helpers.js';

const L = localize('module-M15-face-symbol');

export default class FaceSymbolModule extends CardMagicianModule {
    loadImage(opt) {
        opt.imageUrl = this.resolveAsset(opt.imagePath);
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
            default: null
        };
        this.loadFaceSymbolImages(this.faceSymbolField.options);
    }

    updateFaceSymbol(card) {
        const options = this.faceSymbolField.options;
        const option = resolveOption(options, card.faceSymbol);
        card.resolvedFaceSymbol = option?.compute
            ? option.compute(card, options)
            : option;
        this.requestRender();
    }

    bind(card, watch) {
        watch(card, ['colorIdentity', 'superType', 'parent'],
              () => changed(this.faceSymbolField, '')
        );
        watch(card, ['faceSymbol', 'parent'], () => this.updateFaceSymbol(card));
    }

    render(card) {
        if (!card.faceSymbol?.imageUrl) return;
        const faceSymbolClass = getFaceSymbolClass(card.resolvedFaceSymbol);
        return (
            `<img src="${card.resolvedFaceSymbol.imageUrl}" class="${faceSymbolClass}"/>`
        );
    }

    get fields() {
        return [this.faceSymbolField];
    }

    async styles() {
        return [await this.loadFile('style.css')];
    }
}
