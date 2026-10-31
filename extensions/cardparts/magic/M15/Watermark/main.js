import makeWatermarkOptions from './src/watermarkOptions.js';
import { resolveOption } from '../FaceSymbol/src/helpers.js';
import Watermark from './src/Watermark.js';

const L = localize('module-M15-watermark');

export default class WatermarkModule extends CardMagicianModule {
    static createFields() {
        return [{
            id: 'watermark',
            type: 'nested-menu',
            label: L`Watermark`,
            options: makeWatermarkOptions(),
            default: null
        }];
    }

    loadImage(opt) {
        opt.imageUrl = this.resolveAsset(opt.imagePath);
    }

    loadWatermarkImages(options) {
        options.concat(options.flatMap(opt => opt.items || []))
            .filter(opt => Boolean(opt.imagePath))
            .map(opt => this.loadImage(opt));
    }

    async init() {
        this.watermarkField = this.fields[0];
        this.loadWatermarkImages(this.watermarkField.options);
    }

    async generateWatermarkImage(card) {
        if (!card.resolvedWatermark?.imageUrl) return null;
        const watermark = new Watermark(card, this);
        return await watermark.render();
    }

    resolveWatermark(card) {
        const options = this.watermarkField.options;
        const option = resolveOption(options, card.watermark);
        return option?.compute
            ? option.compute(card, options)
            : option;
    }

    async updateWatermark(card) {
        card.resolvedWatermark = this.resolveWatermark(card);
        this.watermarkImageUrl = await this.generateWatermarkImage(card);
        this.requestRender();
    }

    bind(card, watch) {
        watch(card, ['watermark', 'colorIdentity'], () => this.updateWatermark(card));
    }

    render(card) {
        if (!this.watermarkImageUrl) return;
        return `<img src="${this.watermarkImageUrl}" />`;
    }

    async styles() {
        return [await this.loadFile('style.css')];
    }
}
