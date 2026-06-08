import CardFrame from '../../Frame/src/CardFrame.js';
import Frame from '../../Frame/src/mixins/Frame.js';
import TrimMasks from '../../Frame/src/mixins/TrimMasks.js';
import VehicleTrim from '../../Frame/src/mixins/VehicleTrim.js';
import SnowTrim from '../../Frame/src/mixins/SnowTrim.js';
import Border from '../../Frame/src/mixins/Border.js';
import Node from '../../Frame/src/mixins/Node.js';
import Loyalty from './Loyalty.js';
import WalkerAbilities from './WalkerAbilities.js';
import NyxTrim from '../../Frame/src/mixins/NyxTrim.js';

export default class WalkerFrame extends CardFrame.with(
    Frame,
    TrimMasks,
    VehicleTrim,
    SnowTrim,
    NyxTrim,
    Border,
    Node,
    WalkerAbilities,
    // Loyalty,
) {
    get frameExt() {
        return '.png';
    }

    static matches() {
        return true;
    }

    get artDimensions() {
        return { width: 316, height: 429 };
    }

    resolveWalkerAssetPath(path) {
        return new URL(`../assets/${path}`, import.meta.url).pathname;
    }

    // --- FRAME ---
    get frameHeight() {
        return this.card.isTall?.() ? 'tall' : 'normal';
    }

    get frameMaskFolder() {
        return this.resolveWalkerAssetPath(`mask/frame mask/${this.frameHeight}`);
    }

    get frameMaskFilename() {
        // tall walkers don't support fullart
        if (this.frameHeight === 'tall')
            return 'base.png';
        return this.card.artSize === 'borderless' ? 'full.png' : 'base.png';
    }

    get frameBlendMaskFolder() {
        return this.resolveWalkerAssetPath(`mask/frame blend mask/${this.frameHeight}`);
    }

    get frameFolder() {
        return this.resolveWalkerAssetPath(`frame/${this.frameHeight}`);
    }
}
