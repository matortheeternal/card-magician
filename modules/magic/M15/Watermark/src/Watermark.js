export default class Watermark {
    constructor(card, ctx) {
        this.card = card;
        this.ctx = ctx;
    }

    resolveWatermarkColors() {
        const colors = this.card.colorIdentity?.colors || [];
        if (colors.length === 1) return [colors[0].char];
        if (colors.length !== 2) return null;

        const firstColor = colors[0].char;
        const secondColor = colors[1].char;
        const frame = this.card.activeFrame?.();
        return frame?.getHybridOrder
            ? frame.getHybridOrder(this.card, firstColor, secondColor)
            : [firstColor, secondColor];
    }

    resolveSpotlightImage(color) {
        const key = color + (this.card.isLand?.() ? 'l' : '');
        return this.ctx.resolveAsset(`spotlight/${key}.png`);
    }

    buildMaskedWatermark(imageUrl, color) {
        const img = this.resolveSpotlightImage(color);
        return this.ctx.maskedBlend(imageUrl, img, imageUrl);
    }

    buildWatermarkImage(watermark) {
        const watermarkImageUrl = watermark.imageUrl;
        const colors = this.resolveWatermarkColors();
        if (!colors) return watermarkImageUrl;

        const imgA = this.buildMaskedWatermark(watermarkImageUrl, colors[0]);
        if (colors.length !== 2) return imgA;

        const imgB = this.buildMaskedWatermark(watermarkImageUrl, colors[1]);
        return this.ctx.linearBlend(imgA, imgB, 0.4, 0, 0.6, 0);
    }

    async render() {
        const watermark = this.card.resolvedWatermark;
        if (watermark.colored) return watermark.imageUrl;
        const image = this.buildWatermarkImage(watermark);
        return typeof image === 'string'
            ? image
            : await image.publish();
    }
}
