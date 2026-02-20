import CardFrame from '../../Frame/src/CardFrame.js';
import Border from '../../Frame/src/mixins/Border.js';
import TopTexture from './mixins/TopTexture.js';
import BottomTexture from './mixins/BottomTexture.js';
import TopFrame from './mixins/TopFrame.js';
import BottomFrame from './mixins/BottomFrame.js';
import Frame from '../../Frame/src/mixins/Frame.js';

export default class SplitFrame extends CardFrame.with(
    Frame,
    TopTexture,
    TopFrame,
    BottomTexture,
    BottomFrame,
    Border,
) {
    static matches() {
        return true;
    }

    resolveSplitAssetPath(path) {
        return new URL(`../assets/${path}`, import.meta.url).pathname;
    }

    get artDimensions() {
        return { width: 808, height: 280 };
    }

    // --- FRAME ---
    get frameExt() {
        return '.png';
    }

    get frameMaskFolder() {
        return this.resolveSplitAssetPath('mask/frame');
    }

    get frameFolder() {
        return this.resolveSplitAssetPath('frame/normal');
    }

    async resolveFrame() {
        return null;
    }

    // --- BORDER ---
    get borderMaskFilename() {
        if (this.card.artSize === 'borderless') return 'borderless.png';
        if (this.card.isRoom?.()) return 'room.png';
        return 'base.png';
    }

    get borderMaskUrl() {
        return this.resolveSplitAssetPath(`mask/border/${this.borderMaskFilename}`);
    }
}
