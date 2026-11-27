import CardFrame from '../../Frame/src/CardFrame.js';
import Border from '../../Frame/src/mixins/Border.js';
import TopTexture from './mixins/TopTexture.js';
import BottomTexture from './mixins/BottomTexture.js';
import TopFrame from './mixins/TopFrame.js';
import BottomFrame from './mixins/BottomFrame.js';
import Frame from '../../Frame/src/mixins/Frame.js';
import PT from '../../Frame/src/mixins/PT.js';

export default class SplitFrame extends CardFrame.with(
    Frame,
    TopTexture,
    TopFrame,
    BottomTexture,
    BottomFrame,
    Border,
    PT,
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

    get frameBlendMaskFolder() {
        return this.resolveSplitAssetPath('mask/split');
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

    resolveTextureImage(half) {
        const textureFolder = this.resolveSplitAssetPath('texture');
        return half.coloredBlend(textureFolder, half.card, {
            ext: '.png',
            blendMaskFolder: this.frameBlendMaskFolder
        });
    }

    resolveHalfTexture(side, subcard) {
        const image = this.resolveTextureImage(this.forSubcard(subcard));
        const maskUrl = this.resolveSplitAssetPath('mask/half.png');
        return this.background(`${side}-texture`, this.ctx.maskImage(image, maskUrl));
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
