import CardFrame from '../../Frame/src/CardFrame.js';
import Frame from '../../Frame/src/mixins/Frame.js';
import TrimMasks from '../../Frame/src/mixins/TrimMasks.js';
import VehicleTrim from '../../Frame/src/mixins/VehicleTrim.js';
import SnowTrim from '../../Frame/src/mixins/SnowTrim.js';
import Border from '../../Frame/src/mixins/Border.js';
import Node from '../../Frame/src/mixins/Node.js';
import Crowns from '../../Frame/src/mixins/Crowns.js';
import PT from '../../Frame/src/mixins/PT.js';
import Bookmark from './Bookmark.js';
import NyxTrim from '../../Frame/src/mixins/NyxTrim.js';

export default class SagaFrame extends CardFrame.with(
    Frame,
    TrimMasks,
    VehicleTrim,
    SnowTrim,
    NyxTrim,
    Border,
    Node,
    Crowns,
    Bookmark,
    PT,
) {
    static matches() {
        return true;
    }

    get artDimensions() {
        return { width: 158, height: 446 };
    }

    resolveSagaAssetPath(path) {
        return new URL(`../assets/${path}`, import.meta.url).pathname;
    }

    // --- FRAME ---
    get frameMaskFolder() {
        return this.resolveSagaAssetPath('mask/frame');
    }

    get frameMaskFilename() {
        return 'saga.png';
    }

    get frameBlendMaskFolder() {
        return this.resolveSagaAssetPath('mask/saga');
    }

    get frameFolder() {
        return this.resolveSagaAssetPath('frame/saga');
    }
}
