import CardFrame from './CardFrame.js';
import Frame from './mixins/Frame.js';
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
import NyxTrim from './mixins/NyxTrim.js';
import Alias from './mixins/Alias.js';

export default class FNMPromoFrame extends CardFrame.with(
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
    Alias,
    PT,
) {
    static matches(card) {
        return card.frame === 'fnm';
    }

    /* --- FRAME --- */
    get frameExt() {
        return '.png';
    }

    get frameSubfolder() {
        return 'fnm';
    }

    get frameId() {
        return 'fnm';
    }

    // --- MIRACLE TRIM ---
    get miracleSubfolder() {
        return 'fnm';
    }

    // --- CROWNS ---
    get crownMasks() {
        return [
            ...super.crownMasks,
            this.resolveAssetPath('mask/frame/crown_fnm.png')
        ];
    }

    // --- PT ---
    get ptSubfolder() {
        return 'fnm';
    }
}
