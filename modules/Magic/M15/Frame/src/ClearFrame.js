import CardFrame from './CardFrame.js';
import FrameResolution from './mixins/Frame.js';
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

export default class ClearFrame extends CardFrame.with(
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
        return card.frame === 'clear';
    }

    resolveClearAssetPath(path) {
        return new URL(`../assets/${path}`, import.meta.url).pathname;
    }

    coloredBlend(folder) {
        return `${folder}/x.png`;
    }

    get artDimensions() {
        return { width: 343, height: 471 };
    }

    /* --- FRAME --- */
    maskFrame(imageUrl) {
        const maskUrl = this.resolveClearAssetPath('mask/frame/clear.png');
        return this.ctx.maskImage(imageUrl, maskUrl);
    }

    get frameId() {
        return 'clear';
    }

    /* --- CROWN --- */
    get crownMasks() {
        const masks = super.crownMasks;
        if (this.card.hasAlias?.())
            masks.push('mask/crown/expanded_alias.png');
        return masks;
    }

    /* --- MIRACLE --- */
    async resolveMiracleTrim(card) {
        if (!card.isMiracle?.()) return null;
        const imageUrl = `${this.miracleFolder}/x.png`;
        return this.background('miracle-trim', imageUrl);
    }
}
