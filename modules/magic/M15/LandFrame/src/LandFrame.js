import CardFrame from '../../Frame/src/CardFrame.js';
import Frame from '../../Frame/src/mixins/Frame.js';
import Border from '../../Frame/src/mixins/Border.js';
import Crowns from '../../Frame/src/mixins/Crowns.js';
import LandSymbol from './mixins/LandSymbol.js';
import PT from '../../Frame/src/mixins/PT.js';

export default class LandFrame extends CardFrame.with(
    Frame,
    Border,
    Crowns,
    LandSymbol,
    PT,
) {
    static matches() {
        return true;
    }

    get artDimensions() {
        return { width: 345, height: 468 };
    }

    resolveLandAssetPath(path) {
        return new URL(`../assets/${path}`, import.meta.url).pathname;
    }

    // --- FRAME ---
    get frameHasLandTemplates() {
        return false;
    }

    get frameExt() {
        return '.png';
    }

    get frameFolder() {
        return this.resolveLandAssetPath('frame/normal');
    }

    get frameId() {
        return 'normal';
    }

    maskFrame(image) {
        return image;
    }
}
