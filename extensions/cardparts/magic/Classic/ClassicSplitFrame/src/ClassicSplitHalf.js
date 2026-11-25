import GradientCardFrame from '../../ClassicFrame/src/GradientCardFrame.js';
import FooterColor from '../../ClassicFrame/src/mixins/FooterColor.js';
import HalfFrame from './mixins/HalfFrame.js';

export default class ClassicSplitHalf extends GradientCardFrame.with(
    HalfFrame,
    FooterColor,
) {
    get frameId() {
        return 'classic';
    }

    /* --- LANDS --- */
    get landTrimMaskUrl() {
        return `${this.frameBlendMaskFolder}/blend_land.png`;
    }

    coloredBlend(folder, card, options) {
        const image = super.coloredBlend(folder, card, options);
        if (!this.isLand) return image;
        return this.ctx.maskedBlend(
            image,
            this.resolveColorKey(folder, 'c', options),
            this.landTrimMaskUrl
        );
    }
}
