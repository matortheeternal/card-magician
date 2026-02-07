import CardFrame from './CardFrame.js';
import FrameResolution from './mixins/FrameResolution.js';
import TrimMasks from './mixins/TrimMasks.js';
import Crowns from './mixins/Crowns.js';
import VehicleTrim from './mixins/VehicleTrim.js';
import DraftTrim from './mixins/DraftTrim.js';
import SnowTrim from './mixins/SnowTrim.js';
import Border from './mixins/Border.js';
import Scrolls from './mixins/Scrolls.js';
import MiracleTrim from './mixins/MiracleTrim.js';
import Node from './mixins/Node.js';
import PT from './mixins/PT.js';

export default class NormalFrame extends CardFrame.with(
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
    static matches() {
        return true;
    }

    /* -- CROWNS -- */
    get isExpanded() {
        return this.card.usesExpandedArt?.() || this.card.isPuma?.();
    }

    get isMaxArt() {
        return this.card.isBorderless?.() && this.card.isFrameless?.();
    }

    get crownMasks() {
        const masks = super.crownMasks;
        if (this.isMaxArt() && this.card.isMiracle())
            masks.push('mask/crown/miracle_borderless.png');
        if (this.isExpanded && this.card.hasAlias?.())
            masks.push('mask/crown/expanded_alias.png');
        return masks;
    }
}
