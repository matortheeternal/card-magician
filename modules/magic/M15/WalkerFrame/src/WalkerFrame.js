import CardFrame from '../../Frame/src/CardFrame.js';
import Frame from '../../Frame/src/mixins/Frame.js';
import TrimMasks from '../../Frame/src/mixins/TrimMasks.js';
import VehicleTrim from '../../Frame/src/mixins/VehicleTrim.js';
import SnowTrim from '../../Frame/src/mixins/SnowTrim.js';
import Border from '../../Frame/src/mixins/Border.js';
import Node from '../../Frame/src/mixins/Node.js';
import Crowns from '../../Frame/src/mixins/Crowns.js';
import Loyalty from './Loyalty.js';
import NyxTrim from '../../Frame/src/mixins/NyxTrim.js';

export default class WalkerFrame extends CardFrame.with(
    Frame,
    TrimMasks,
    VehicleTrim,
    SnowTrim,
    NyxTrim,
    Border,
    Node,
    Crowns,
    Loyalty,
) {
    static matches() {
        return true;
    }

    get artDimensions() {
        return { width: 158, height: 446 };
    }

    resolveWalkerAssetPath(path) {
        return new URL(`../assets/${path}`, import.meta.url).pathname;
    }

    // --- FRAME ---
    get frameMaskFolder() {
        return this.resolveWalkerAssetPath('mask/frame');
    }

    get frameMaskFilename() {
        return 'walker.png';
    }

    get frameBlendMaskFolder() {
        return this.resolveAssetPath('mask/walker');
    }

    get frameFolder() {
        return this.resolveWalkerAssetPath('frame/walker');
    }
}
