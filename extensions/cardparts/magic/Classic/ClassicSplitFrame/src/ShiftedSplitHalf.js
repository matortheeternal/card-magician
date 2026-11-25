import ClassicCardFrame from '../../ClassicFrame/src/ClassicCardFrame.js';
import FooterColor from '../../ClassicFrame/src/mixins/FooterColor.js';
import PT from '../../../M15/Frame/src/mixins/PT.js';
import HalfFrame from './mixins/HalfFrame.js';

export default class ShiftedSplitHalf extends ClassicCardFrame.with(
    HalfFrame,
    PT,
    FooterColor,
) {
    get frameId() {
        return 'shifted';
    }

    get hybridBlendKey() {
        return `${super.hybridBlendKey}l`;
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

    get nameFontSizes() {
        return { matrix: 17.5, magicMedieval: 18.5, mplantin: 17 };
    }

    get typeFont() {
        return { family: 'Matrix', size: 16 };
    }

    /* --- FOOTER --- */
    get lightFooterKeys() {
        return ['b', 'l'];
    }
}
