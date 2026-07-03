import CardFrame from '../../Frame/src/CardFrame.js';
import Frame from '../../Frame/src/mixins/Frame.js';
import Border from '../../Frame/src/mixins/Border.js';
import PT from '../../Frame/src/mixins/PT.js';
import Bookmark from '../../SagaFrame/src/Bookmark.js';
import BookmarkStripe from '../../SagaFrame/src/BookmarkStripe.js';

export default class SagaCreatureFrame extends CardFrame.with(
    Frame,
    Border,
    Bookmark,
    BookmarkStripe,
    PT,
) {
    static matches() {
        return true;
    }

    get artDimensions() {
        return { width: 157, height: 283 };
    }

    resolveSagaAssetPath(path) {
        return new URL(`../assets/${path}`, import.meta.url).pathname;
    }

    // --- FRAME ---
    get frameId() {
        return 'saga-creature';
    }

    get frameExt() {
        return '.png';
    }

    get frameHasLandTemplates() {
        return false;
    }

    get useHybridBlend() {
        return false;
    }

    get frameMaskFolder() {
        return this.resolveSagaAssetPath('mask/frame');
    }

    get frameMaskFilename() {
        return 'standard.png';
    }

    get frameBlendMaskFolder() {
        return this.resolveSagaAssetPath('mask/saga');
    }

    get frameSubfolder() {
        if (this.card.ubStyle === 'standard')
            return 'beyond';
        return 'standard';
    }

    get frameFolder() {
        return this.resolveSagaAssetPath(`frame/${this.frameSubfolder}`);
    }
}
