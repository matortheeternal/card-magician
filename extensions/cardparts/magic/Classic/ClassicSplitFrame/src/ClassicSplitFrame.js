import SplitCardFrame from './SplitCardFrame.js';
import ClassicSplitHalf from './ClassicSplitHalf.js';

const ART_SIZES = {
    standard: { width: 394, height: 130 },
};

export default class ClassicSplitFrame extends SplitCardFrame {
    static matches() {
        return true;
    }

    get artSizes() {
        return ART_SIZES;
    }

    get frameId() {
        return 'classic';
    }

    get halfFrameClass() {
        return ClassicSplitHalf;
    }
}
