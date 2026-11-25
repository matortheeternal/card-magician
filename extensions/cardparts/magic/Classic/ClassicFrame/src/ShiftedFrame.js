import ClassicCardFrame from './ClassicCardFrame.js';
import Frame from '../../../M15/Frame/src/mixins/Frame.js';
import Border from '../../../M15/Frame/src/mixins/Border.js';
import PT from '../../../M15/Frame/src/mixins/PT.js';
import LevelPTs from '../../../M15/Frame/src/mixins/LevelPTs.js';
import FooterColor from './mixins/FooterColor.js';
import LevelArrows from './mixins/LevelArrows.js';

const ART_SIZES = {
    standard: { width: 311, height: 228, mask: 'shifted_standard.png' },
    extended: { width: 311, height: 408, mask: 'shifted_extended.png' },
    frameless: { width: 340, height: 488, mask: 'shifted_fullart.png' },
    borderless: { width: 375, height: 523, mask: 'shifted_fullart.png' },
};

export default class ShiftedFrame extends ClassicCardFrame.with(
    Frame,
    Border,
    PT,
    LevelPTs,
    FooterColor,
    LevelArrows,
) {
    static matches(card) {
        return card.frame === 'shifted';
    }

    get artSizes() {
        return ART_SIZES;
    }

    /* --- FRAME --- */
    get frameSubfolder() {
        return 'shifted';
    }

    get frameMaskFilename() {
        return this.artSizes[this.artSize].mask;
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

    /* --- BORDER --- */
    get borderMaskFilename() {
        return 'shifted.png';
    }

    resolveBorder(card) {
        if (this.isBorderless) return null;
        return super.resolveBorder(card);
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

    /* --- LEVELS --- */
    getPtMult(level) {
        return this.resolveAssetPath(`mask/shifted/ptmult_${level}.png`);
    }

    /* --- TYPOGRAPHY --- */
    get defaultNameFont() {
        return 'matrix';
    }

    get nameFontSizes() {
        return { matrix: 22.5, magicMedieval: 20, mplantin: 20 };
    }

    get typeFont() {
        return { family: 'Matrix', size: 19 };
    }

    /* --- FOOTER --- */
    get lightFooterKeys() {
        return ['b', 'l'];
    }
}
