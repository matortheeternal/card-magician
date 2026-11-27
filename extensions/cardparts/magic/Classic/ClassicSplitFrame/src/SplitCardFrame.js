import ClassicCardFrame from '../../ClassicFrame/src/ClassicCardFrame.js';
import Border from '../../../M15/Frame/src/mixins/Border.js';
import subcardCard from '../../../M15/Frame/src/subcardCard.js';

export default class SplitCardFrame extends ClassicCardFrame.with(Border) {
    resolveAssetPath(path) {
        return new URL(`../assets/${path}`, import.meta.url).pathname;
    }

    createHalf(half) {
        return new this.halfFrameClass(subcardCard(half, this.card), this.ctx);
    }

    /* --- BORDER --- */
    get borderMaskFilename() {
        return 'split.png';
    }
}
