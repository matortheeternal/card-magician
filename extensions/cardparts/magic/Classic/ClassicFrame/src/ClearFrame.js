import ClassicCardFrame from './ClassicCardFrame.js';
import Frame from '../../../M15/Frame/src/mixins/Frame.js';
import ArtLiner from './mixins/ArtLiner.js';
import Border from '../../../M15/Frame/src/mixins/Border.js';
import FooterColor from './mixins/FooterColor.js';

const DEFAULT_FRAME_OPACITY = 75;

const ART_SIZES = {
    standard: { width: 286, height: 233 },
    frameless: { width: 337, height: 485 },
    borderless: { width: 375, height: 523 },
};

export default class ClearFrame extends ClassicCardFrame.with(
    Frame,
    ArtLiner,
    Border,
    FooterColor,
) {
    static matches(card) {
        return card.frame === 'clear';
    }

    get artSizes() {
        return ART_SIZES;
    }

    /* --- FRAME --- */
    get frameSubfolder() {
        return 'clear';
    }

    get frameId() {
        return 'clear';
    }

    get frameOpacityPercent() {
        const { frameOpacity } = this.card;
        if ([undefined, ''].includes(frameOpacity)) return DEFAULT_FRAME_OPACITY;
        return Math.min(Math.max(Number(frameOpacity), 0), 100);
    }

    get frameOpacity() {
        return this.frameOpacityPercent / 100;
    }

    coloredBlend(folder) {
        return this.ctx.makeTransparent(`${folder}/frame.png`, this.frameOpacity);
    }

    maskFrame(image) {
        return image;
    }

    /* --- BORDER --- */
    get borderMaskFilename() {
        return 'classic.png';
    }

    resolveBorder(card) {
        if (this.isBorderless) return null;
        return super.resolveBorder(card);
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
        return ['w', 'u', 'b', 'r', 'g', 'm', 'a', 'c', 'l'];
    }
}
