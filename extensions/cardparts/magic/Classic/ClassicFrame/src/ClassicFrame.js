import GradientCardFrame from './GradientCardFrame.js';
import Frame from '../../../M15/Frame/src/mixins/Frame.js';
import Border from '../../../M15/Frame/src/mixins/Border.js';
import FooterColor from './mixins/FooterColor.js';

const ART_SIZES = {
    standard: { width: 286, height: 233 },
    background: { width: 375, height: 523 },
};

export default class ClassicFrame extends GradientCardFrame.with(
    Frame,
    Border,
    FooterColor,
) {
    static matches(card) {
        return card.frame === 'classic';
    }

    get artSizes() {
        return ART_SIZES;
    }

    /* --- FRAME --- */
    get frameSubfolder() {
        return 'classic';
    }

    get frameMaskFilename() {
        return `classic_${this.artSize}.png`;
    }

    get frameBlendMaskFolder() {
        return this.resolveAssetPath('mask/classic');
    }

    get frameId() {
        return 'classic';
    }

    /* --- ELDRAZI COLORLESS --- */
    get useEldraziColorless() {
        return this.card.colorlessStyle === 'eldrazi'
            && !this.isLand
            && this.card.getCardColorKey() === 'c';
    }

    /* --- NONBASIC LANDS --- */
    get useNonbasicLandColoring() {
        return this.isLand
            && !this.card.isBasicLand?.()
            && !this.useAlphaBlend
            && this.card.nonbasicLandColoring !== 'none';
    }

    get nonbasicLandMaskUrl() {
        const coloring = this.card.nonbasicLandColoring;
        return `${this.frameBlendMaskFolder}/blend_land_${coloring}.png`;
    }

    colorNonbasicLand(image, folder, options) {
        return this.ctx.maskedBlend(
            image,
            this.resolveColorKey(folder, 'c', options),
            this.nonbasicLandMaskUrl
        );
    }

    coloredBlend(folder, card, options) {
        if (this.useEldraziColorless) return `${folder}/x${options.ext}`;
        const image = super.coloredBlend(folder, card, options);
        if (!this.useNonbasicLandColoring) return image;
        return this.colorNonbasicLand(image, folder, options);
    }

    /* --- BORDER --- */
    get borderMaskFilename() {
        return 'classic.png';
    }

    resolveBorder(card) {
        if (this.hasArtBackground) return null;
        return super.resolveBorder(card);
    }

    /* --- TYPOGRAPHY --- */
    get defaultNameFont() {
        return 'magicMedieval';
    }

    get nameFontSizes() {
        return { matrix: 22.5, magicMedieval: 21.5 };
    }

    get typeFont() {
        return { family: 'MPlantin', size: 16 };
    }

    /* --- FOOTER --- */
    get lightFooterKeys() {
        return ['u', 'b', 'r', 'g', 'm', 'a', 'c', 'l'];
    }
}
