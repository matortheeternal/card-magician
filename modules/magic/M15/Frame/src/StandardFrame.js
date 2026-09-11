import CardFrame from './CardFrame.js';
import Frame from './mixins/Frame.js';
import TrimMasks from './mixins/TrimMasks.js';
import Crowns from './mixins/Crowns.js';
import VehicleTrim from './mixins/VehicleTrim.js';
import DraftTrim from './mixins/DraftTrim.js';
import SnowTrim from './mixins/SnowTrim.js';
import Border from './mixins/Border.js';
import Scrolls from './mixins/Scrolls.js';
import MiracleTrim from './mixins/MiracleTrim.js';
import Node from './mixins/Node.js';
import Levels from './mixins/Levels.js';
import PT from './mixins/PT.js';
import LevelPTs from './mixins/LevelPTs.js';
import NyxTrim from './mixins/NyxTrim.js';

export default class StandardFrame extends CardFrame.with(
    Frame,
    TrimMasks,
    VehicleTrim,
    SnowTrim,
    NyxTrim,
    DraftTrim,
    Border,
    Scrolls,
    Node,
    Crowns,
    MiracleTrim,
    Levels,
    PT,
    LevelPTs,
) {
    static matches() {
        return true;
    }

    get artDimensions() {
        if (this.card.artSize === 'frameless')
            return { width: 343, height: 471 };
        if (this.card.artSize === 'borderless')
            return { width: 375, height: 467 };
        return{ width: 316, height: 223 };
    }

    /* -- CROWNS -- */
    get isExpanded() {
        return this.card.artSize === 'borderless'
            || this.card.artSize === 'frameless'
            || this.card.artSize === 'puma';
    }

    get crownMasks() {
        const masks = super.crownMasks;
        if (this.card.artSize === 'borderless' && this.card.isMiracle())
            masks.push('mask/crown/miracle_borderless.png');
        if (this.isExpanded && this.card.hasAlias?.())
            masks.push('mask/crown/expanded_alias.png');
        return masks;
    }
}
