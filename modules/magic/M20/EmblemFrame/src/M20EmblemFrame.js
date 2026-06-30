import CardFrame from '../../../M15/Frame/src/CardFrame.js';
import Frame from '../../../M15/Frame/src/mixins/Frame.js';
import Border from '../../../M15/Frame/src/mixins/Border.js';
import EmblemElements from './mixins/EmblemElements.js';
import UpperFrame from './mixins/UpperFrame.js';

export default class M20EmblemFrame extends CardFrame.with(
    Frame,
    UpperFrame,
    EmblemElements,
    Border,
) {
    static matches() {
        return true;
    }

    get frameId() {
        return 'emblem';
    }

    resolveEmblemAssetPath(path) {
        return new URL(`../assets/${path}`, import.meta.url).pathname;
    }

    // --- LAYOUT ---
    get artDimensions() {
        return { width: 375, height: 523 };
    }

    // --- FRAME RESOLUTION ---
    async resolveFrame() {
        const image = this.resolveEmblemAssetPath('frame.png');
        return this.background(this.frameId, image);
    }
}
