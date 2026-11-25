import GradientCardFrame from '../../ClassicFrame/src/GradientCardFrame.js';
import Frame from '../../../M15/Frame/src/mixins/Frame.js';
import Border from '../../../M15/Frame/src/mixins/Border.js';
import FooterColor from '../../ClassicFrame/src/mixins/FooterColor.js';

const ART_SIZES = {
    standard: { width: 286, height: 270 },
};

export default class TokenFrame extends GradientCardFrame.with(
    Frame,
    Border,
    FooterColor,
) {
    static matches() {
        return true;
    }

    get artSizes() {
        return ART_SIZES;
    }

    resolveAssetPath(path) {
        return new URL(`../assets/${path}`, import.meta.url).pathname;
    }

    /* --- FRAME --- */
    get frameSubfolder() {
        return 'token';
    }

    get frameMaskFilename() {
        return 'token.png';
    }

    get frameHasLandTemplates() {
        return false;
    }

    get frameBlendMaskFolder() {
        return this.resolveAssetPath('mask/token');
    }

    get frameId() {
        return 'token';
    }

    /* --- BORDER --- */
    get borderMaskFilename() {
        return 'token.png';
    }

    /* --- TYPOGRAPHY --- */
    get defaultNameFont() {
        return 'mplantin';
    }

    get nameFontSizes() {
        return { matrix: 22.5, magicMedieval: 21.5, mplantin: 22.5 };
    }
}
