import SplitCardFrame from './SplitCardFrame.js';
import ShiftedSplitHalf from './ShiftedSplitHalf.js';

const ART_SIZES = {
    standard: { width: 432, height: 159 },
};

export default class ShiftedSplitFrame extends SplitCardFrame {
    static matches(card) {
        return card.frame === 'shifted';
    }

    get artSizes() {
        return ART_SIZES;
    }

    get frameId() {
        return 'shifted';
    }

    get halfFrameClass() {
        return ShiftedSplitHalf;
    }

    get showIllustratorLabel() {
        return false;
    }
}
