import ClassicCardFrame from './ClassicCardFrame.js';
import Frame from '../../../M15/Frame/src/mixins/Frame.js';
import Border from '../../../M15/Frame/src/mixins/Border.js';
import PT from '../../../M15/Frame/src/mixins/PT.js';
import FooterColor from './mixins/FooterColor.js';

const ART_DIMENSIONS = {
    standard: { width: 311, height: 228 },
    extended: { width: 311, height: 408 },
};

export default class ShiftedFrame extends ClassicCardFrame.with(
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

    /* --- TYPOGRAPHY --- */
    get defaultNameFont() {
        return 'matrix';
    }

    get typeFont() {
        return { family: 'Matrix', size: 19 };
    }

    /* --- FOOTER --- */
    get lightFooterKeys() {
        return ['b', 'l'];
    }
}
