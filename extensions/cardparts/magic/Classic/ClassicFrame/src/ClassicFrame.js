import ClassicCardFrame from './ClassicCardFrame.js';
import Frame from '../../../M15/Frame/src/mixins/Frame.js';
import Border from '../../../M15/Frame/src/mixins/Border.js';
import FooterColor from './mixins/FooterColor.js';

export default class ClassicFrame extends ClassicCardFrame.with(
    Frame,
    Border,
    FooterColor,
) {
    static matches(card) {
        return card.frame === 'classic';
    }

    get artDimensions() {
        return { width: 286, height: 233 };
    }

    /* --- FRAME --- */
    get frameSubfolder() {
        return 'classic';
    }

    get frameMaskFilename() {
        return 'classic.png';
    }

    get frameBlendMaskFolder() {
        return this.resolveAssetPath('mask/classic');
    }

    get frameId() {
        return 'classic';
    }

    get useLandHybridBlend() {
        return false;
    }

    get useHybridBlend() {
        return false;
    }

    gradientMaskUrl(gradient) {
        return `${this.blendMaskFolder}/blend_gradient_${gradient}.png`;
    }

    get multicolorBlendMaskUrl() {
        return this.gradientMaskUrl(this.card.multicolorGradient);
    }

    get useArtifactBlend() {
        return super.useArtifactBlend && !this.useMulticolorBlend;
    }

    get artifactBlendMaskUrl() {
        return this.gradientMaskUrl(this.card.artifactGradient);
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

    /* --- TYPOGRAPHY --- */
    get defaultNameFont() {
        return 'magicMedieval';
    }

    get nameFontSizes() {
        return { matrix: 22.5, magicMedieval: 22.5 };
    }

    get typeFont() {
        return { family: 'MPlantin', size: 16 };
    }

    /* --- FOOTER --- */
    get lightFooterKeys() {
        return ['u', 'b', 'r', 'g', 'm', 'a', 'c', 'l'];
    }
}
