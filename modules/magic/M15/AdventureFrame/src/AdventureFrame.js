import CardFrame from '../../Frame/src/CardFrame.js';
import Frame from '../../Frame/src/mixins/Frame.js';
import TrimMasks from '../../Frame/src/mixins/TrimMasks.js';
import VehicleTrim from '../../Frame/src/mixins/VehicleTrim.js';
import SnowTrim from '../../Frame/src/mixins/SnowTrim.js';
import DraftTrim from '../../Frame/src/mixins/DraftTrim.js';
import Border from '../../Frame/src/mixins/Border.js';
import Scrolls from '../../Frame/src/mixins/Scrolls.js';
import Node from '../../Frame/src/mixins/Node.js';
import Crowns from '../../Frame/src/mixins/Crowns.js';
import MiracleTrim from '../../Frame/src/mixins/MiracleTrim.js';
import PT from '../../Frame/src/mixins/PT.js';
import Binding from './mixins/Binding.js';
import LeftPage from './mixins/LeftPage.js';
import RightPage from './mixins/RightPage.js';

export default class AdventureFrame extends CardFrame.with(
    Frame,
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
    Binding,
    LeftPage,
    RightPage
) {
    static matches() {
        return true;
    }

    resolveAdventureAssetPath(path) {
        return new URL(`../assets/${path}`, import.meta.url).pathname;
    }

    /* --- FRAME --- */
    get frameId() {
        return this.card.frame === 'reversed'
            ? 'reversed'
            : 'adventure';
    }
}
