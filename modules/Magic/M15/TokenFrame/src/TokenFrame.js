import CardFrame from '../../Frame/src/CardFrame.js';
import Frame from '../../Frame/src/mixins/Frame.js';
import TrimMasks from '../../Frame/src/mixins/TrimMasks.js';
import VehicleTrim from '../../Frame/src/mixins/VehicleTrim.js';
import SnowTrim from '../../Frame/src/mixins/SnowTrim.js';
import NyxTrim from '../../Frame/src/mixins/NyxTrim.js';
import Border from '../../Frame/src/mixins/Border.js';
import Crowns from '../../Frame/src/mixins/Crowns.js';
import PT from '../../Frame/src/mixins/PT.js';

export default class TokenFrame extends CardFrame.with(
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

    // --- LAYOUT ---
    get artDimensions() {
        return { width: 316, height: 290 };
    }

    get frameHeight() {
        if (this.card.hasNoText?.())
            return 'short';
        if (this.card.isTall?.())
            return 'tall';
        return 'normal';
    }

    // --- FRAME RESOLUTION ---
    get frameMaskFolder() {
        return this.resolveTokenAssetPath('mask/frame');
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

    // --- CROWNS ---
    async resolveCrown() {
        if (!this.showCrown) return null;
        const image = this.resolveTokenAssetPath(`element/crown/base.png`);
        return this.background('crown', image);
    }
}
