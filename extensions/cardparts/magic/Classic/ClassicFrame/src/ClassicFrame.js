import GradientCardFrame from './GradientCardFrame.js';
import Frame from '../../../M15/Frame/src/mixins/Frame.js';
import Border from '../../../M15/Frame/src/mixins/Border.js';
import FooterColor from './mixins/FooterColor.js';
import TitleColor from './mixins/TitleColor.js';

const ART_SIZES = {
    standard: { width: 286, height: 233, mask: 'classic_standard.png' },
    frameless: { width: 337, height: 485, mask: 'classic_fullart.png' },
    borderless: { width: 375, height: 523, mask: 'classic_fullart.png' },
};

export default class ClassicFrame extends GradientCardFrame.with(
    Frame,
    Border,
    FooterColor,
    TitleColor,
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
        return this.artSizes[this.artSize].mask;
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
        if (this.isBorderless) return null;
        return super.resolveBorder(card);
    }
}
