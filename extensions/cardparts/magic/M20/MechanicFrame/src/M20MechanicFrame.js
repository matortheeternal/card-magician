import CardFrame from '../../../M15/Frame/src/CardFrame.js';
import Frame from '../../../M15/Frame/src/mixins/Frame.js';

export default class M20MechanicFrame extends CardFrame.with(
    Frame
) {
    static matches() {
        return true;
    }

    resolveMechanicAssetPath(path) {
        return new URL(`../assets/${path}`, import.meta.url).pathname;
    }

    // --- FRAME ---
    async resolveFrame() {
        const image = this.resolveMechanicAssetPath('frame.png');
        return this.background('mechanic', image);
    }
}
