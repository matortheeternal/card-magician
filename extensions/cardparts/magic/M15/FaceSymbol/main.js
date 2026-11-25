import makeSymbolOptions from './src/symbolOptions.js';
import { getFaceSymbolClass, resolveOption } from './src/helpers.js';

const L = localize('module-M15-face-symbol');

export default class FaceSymbolModule extends CardMagicianModule {
    static createFields() {
        return [{
            id: 'faceSymbol',
            type: 'nested-menu',
            label: L`Face Symbol`,
            options: makeSymbolOptions(),
            default: null
        }];
    }

    loadImage(opt) {
        opt.imageUrl = this.resolveAsset(opt.imagePath);
    }

    loadFaceSymbolImages(options) {
        options.concat(options.flatMap(opt => opt.items || []))
            .filter(opt => Boolean(opt.imagePath))
            .forEach(opt => this.loadImage(opt));
    }

    async init() {
        this.faceSymbolField = this.fields[0];
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
        if (!card.resolvedFaceSymbol?.imageUrl) return;
        const faceSymbolClass = getFaceSymbolClass(card.resolvedFaceSymbol);
        return (
            `<img src="${card.resolvedFaceSymbol.imageUrl}" class="${faceSymbolClass}"/>`
        );
    }
}
