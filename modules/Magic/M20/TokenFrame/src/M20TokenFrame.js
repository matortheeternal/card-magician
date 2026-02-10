import CardFrame from '../../../M15/Frame/src/CardFrame.js';
import Frame from '../../../M15/Frame/src/mixins/Frame.js';
import TrimMasks from '../../../M15/Frame/src/mixins/TrimMasks.js';
import VehicleTrim from '../../../M15/Frame/src/mixins/VehicleTrim.js';
import SnowTrim from '../../../M15/Frame/src/mixins/SnowTrim.js';
import NyxTrim from '../../../M15/Frame/src/mixins/NyxTrim.js';
import Border from '../../../M15/Frame/src/mixins/Border.js';
import Crowns from '../../../M15/Frame/src/mixins/Crowns.js';
import PT from '../../../M15/Frame/src/mixins/PT.js';

export default class M20TokenFrame extends CardFrame.with(
    Frame,
    TrimMasks,
    VehicleTrim,
    SnowTrim,
    NyxTrim,
    Border,
    Crowns,
    PT
) {
    static matches() {
        return true;
    }

    resolveTokenAssetPath(path) {
        return new URL(`../assets/${path}`, import.meta.url).pathname;
    }

    // --- HYBRID ---
    getHybridOrder(card, c1, c2) {
        // replce white hybrid frame with colorless
        return super.getHybridOrder(
            card,
            c1 === 'w' ? 'c' : c1,
            c2 === 'w' ? 'c' : c2
        );
    }

    // --- LAYOUT ---
    get artDimensions() {
        return { width: 343, height: 471 };
    }

    get frameHeight() {
        if (this.card.hasNoText?.())
            return 'short';
        if (this.card.isTall?.())
            return 'tall';
        return 'normal';
    }

    // --- FRAME RESOLUTION ---
    get frameExt() {
        return '.png';
    }

    get frameFolder() {
        return this.resolveTokenAssetPath(`frame/${this.frameHeight}`);
    }

    get frameMaskFilename() {
        return `${this.frameHeight}.png`;
    }

    get frameHasLandTemplates() {
        return false;
    }

    get frameBlendMaskFolder() {
        return this.resolveTokenAssetPath(`mask/${this.frameHeight}`);
    }

    get frameId() {
        return 'token';
    }

    // --- TRIM MASKS ---
    get trimMaskFilename() {
        return `${this.frameHeight}.png`;
    }

    get frameMaskFolder() {
        return this.resolveTokenAssetPath('mask/frame');
    }

    // TODO: snowbox, snowtype
}
