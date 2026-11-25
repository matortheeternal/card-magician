import CardFrame from '../../../M15/Frame/src/CardFrame.js';
import Frame from '../../../M15/Frame/src/mixins/Frame.js';
import Border from '../../../M15/Frame/src/mixins/Border.js';
import PT from '../../../M15/Frame/src/mixins/PT.js';
import FooterColor from './mixins/FooterColor.js';

const ART_DIMENSIONS = {
    standard: { width: 311, height: 228 },
    extended: { width: 311, height: 408 },
};

export default class ShiftedFrame extends CardFrame.with(
    Frame,
    Border,
    PT,
    FooterColor,
) {
    static matches(card) {
        return card.frame === 'shifted';
    }

    get artDimensions() {
        return ART_DIMENSIONS[this.card.artSize];
    }

    resolveAssetPath(path) {
        return new URL(`../assets/${path}`, import.meta.url).pathname;
    }

    /* --- FRAME --- */
    get frameSubfolder() {
        return 'shifted';
    }

    get frameMaskFilename() {
        return `shifted_${this.card.artSize}.png`;
    }

    get frameBlendMaskFolder() {
        return this.resolveAssetPath('mask/shifted');
    }

    get frameId() {
        return 'shifted';
    }

    get hybridBlendKey() {
        return `${super.hybridBlendKey}l`;
    }

    /* --- ALPHA DUAL LANDS --- */
    get useAlphaBlend() {
        return this.card.dualLandBlend === 'alpha'
            && this.isLand
            && this.card.colorIdentity.colors.length === 2;
    }

    get alphaBlendMaskUrl() {
        return this.resolveAssetPath('mask/shifted/blend_alpha.png');
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

    /* --- BORDER --- */
    get borderMaskFilename() {
        return 'shifted.png';
    }

    /* --- PT --- */
    get ptSubfolder() {
        return 'shifted';
    }

    getPtPath(card) {
        return this.resolveColorKey(this.ptFolder, this.getPtKey(card), {
            ext: '.png',
            hasLandTemplates: true
        });
    }
}
