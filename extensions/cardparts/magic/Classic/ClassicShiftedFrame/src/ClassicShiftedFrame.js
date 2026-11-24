import CardFrame from '../../../M15/Frame/src/CardFrame.js';
import Frame from '../../../M15/Frame/src/mixins/Frame.js';
import Border from '../../../M15/Frame/src/mixins/Border.js';
import PT from '../../../M15/Frame/src/mixins/PT.js';
import FooterColor from './mixins/FooterColor.js';

export default class ClassicShiftedFrame extends CardFrame.with(
    Frame,
    Border,
    PT,
    FooterColor,
) {
    static matches() {
        return true;
    }

    get artDimensions() {
        return { width: 311, height: 228 };
    }

    resolveAssetPath(path) {
        return new URL(`../assets/${path}`, import.meta.url).pathname;
    }

    /* --- FRAME --- */
    get frameSubfolder() {
        return 'classicshifted';
    }

    get frameMaskFilename() {
        return 'classicshifted.png';
    }

    get frameBlendMaskFolder() {
        return this.resolveAssetPath('mask/classicshifted');
    }

    get frameId() {
        return 'classicshifted';
    }

    get hybridBlendKey() {
        return `${super.hybridBlendKey}l`;
    }

    /* --- BORDER --- */
    get borderMaskFilename() {
        return 'classicshifted.png';
    }

    /* --- PT --- */
    get ptSubfolder() {
        return 'classicshifted';
    }

    getPtPath(card) {
        return this.resolveColorKey(this.ptFolder, this.getPtKey(card), {
            ext: '.png',
            hasLandTemplates: true
        });
    }
}
