import CardFrame from './CardFrame.js';
import FrameResolution from './mixins/FrameResolution.js';
import TrimMasks from './mixins/TrimMasks.js';
import VehicleTrim from './mixins/VehicleTrim.js';
import SnowTrim from './mixins/SnowTrim.js';
import DraftTrim from './mixins/DraftTrim.js';
import Border from './mixins/Border.js';
import Scrolls from './mixins/Scrolls.js';
import Node from './mixins/Node.js';
import Crowns from './mixins/Crowns.js';
import MiracleTrim from './mixins/MiracleTrim.js';
import PT from './mixins/PT.js';

export default class DevoidFrame extends CardFrame.with(
    FrameResolution,
    TrimMasks,
    VehicleTrim,
    SnowTrim,
    DraftTrim,
    Border,
    Scrolls,
    Node,
    Crowns,
    MiracleTrim,
    PT,
) {
    static matches(card) {
        return card.frame === 'devoid';
    }

    resolveDevoidAssetPath(path) {
        return new URL(`../assets/${path}`, import.meta.url).pathname;
    }

    get artDimensions() {
        return { width: 343, height: 429 };
    }

    /* --- FRAME --- */
    get frameExt() {
        return '.png';
    }

    get frameHasLandTemplates() {
        return false;
    }

    get frameFolder() {
        return this.resolveDevoidAssetPath('frame/devoid');
    }

    maskFrame(imageUrl) {
        const maskUrl = this.resolveDevoidAssetPath('mask/frame/clear.png');
        return this.ctx.maskImage(imageUrl, maskUrl);
    }

    get frameId() {
        return 'devoid';
    }

    /* --- TRIM MASKS --- */
    get devoidTrimMaskUrl() {
        return this.resolveDevoidAssetPath('mask/trim/devoid.png');
    }

    maskTrim(imageUrl) {
        const maskedImg = super.maskTrim(imageUrl);
        if (!this.card.otherFrameOptions.avoidCoveringDevoid) return maskedImg;
        return this.ctx.maskImage(maskedImg, this.devoidTrimMaskUrl);
    }

    /* --- CROWN --- */
    get crownMasks() {
        const masks = super.crownMasks;
        if (this.card.hasAlias?.())
            masks.push('mask/crown/expanded_alias.png');
        return masks;
    }
}
