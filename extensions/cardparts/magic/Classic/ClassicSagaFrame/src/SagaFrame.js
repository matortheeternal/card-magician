import ClassicCardFrame from '../../ClassicFrame/src/ClassicCardFrame.js';
import Frame from '../../../M15/Frame/src/mixins/Frame.js';
import Border from '../../../M15/Frame/src/mixins/Border.js';
import FooterColor from '../../ClassicFrame/src/mixins/FooterColor.js';
import TitleColor from '../../ClassicFrame/src/mixins/TitleColor.js';
import ChapterBar from './mixins/ChapterBar.js';

const ART_SIZES = {
    standard: { width: 130, height: 388 },
};

export default class SagaFrame extends ClassicCardFrame.with(
    Frame,
    Border,
    FooterColor,
    TitleColor,
    ChapterBar,
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
        return 'saga';
    }

    get frameMaskFilename() {
        return 'saga.png';
    }

    get frameHasLandTemplates() {
        return false;
    }

    get frameBlendMaskFolder() {
        return null;
    }

    get frameId() {
        return 'saga';
    }

    resolveColorKey(folder, key, options) {
        if (this.isLand) return `${folder}/l${options.ext}`;
        return super.resolveColorKey(folder, key, options);
    }

    resolveColored(folder, card, options) {
        if (card.colorIdentity.isMulticolor())
            return this.resolveColorKey(folder, 'm', options);
        return super.resolveColored(folder, card, options);
    }

    /* --- BORDER --- */
    get borderMaskFilename() {
        return 'saga.png';
    }
}
