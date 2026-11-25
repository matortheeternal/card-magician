import CardFrame from '../../../M15/Frame/src/CardFrame.js';

export default class ClassicCardFrame extends CardFrame {
    resolveAssetPath(path) {
        return new URL(`../assets/${path}`, import.meta.url).pathname;
    }

    /* --- ART --- */
    get artSize() {
        if (Object.hasOwn(this.artSizes, this.card.artSize)) return this.card.artSize;
        return 'standard';
    }

    get artDimensions() {
        const { width, height } = this.artSizes[this.artSize];
        return { width, height };
    }

    get isBorderless() {
        return this.artSize === 'borderless';
    }

    /* --- ALPHA DUAL LANDS --- */
    get useAlphaBlend() {
        return this.card.dualLandBlend === 'alpha'
            && this.isLand
            && this.card.colorIdentity.colors.length === 2;
    }

    get alphaBlendMaskUrl() {
        return `${this.frameBlendMaskFolder}/blend_alpha.png`;
    }

    get useLandHybridBlend() {
        return !this.useAlphaBlend && super.useLandHybridBlend;
    }

    resolveHybridColored(folder, card, options) {
        if (!this.useAlphaBlend)
            return super.resolveHybridColored(folder, card, options);
        return this.resolveAlphaBlend(folder, card, options);
    }

    resolveAlphaBlend(folder, card, options) {
        const [c1, c2] = card.colorIdentity.colors;
        const [dark, light] = this.getHybridOrder(card, c1.char, c2.char);
        return this.ctx.maskedBlend(
            this.resolveColorKey(folder, light, options),
            this.resolveColorKey(folder, dark, options),
            this.alphaBlendMaskUrl
        );
    }

    /* --- TYPOGRAPHY --- */
    get defaultNameFont() {
        return 'magicMedieval';
    }

    get nameFontSizes() {
        return { matrix: 22.5, magicMedieval: 21.5, mplantin: 20 };
    }

    get typeFont() {
        return { family: 'MPlantin', size: 16 };
    }

    /* --- FOOTER --- */
    get lightFooterKeys() {
        return ['u', 'b', 'r', 'g', 'm', 'a', 'c', 'l'];
    }
}
