import CardFrame from '../../../M15/Frame/src/CardFrame.js';
import Border from '../../../M15/Frame/src/mixins/Border.js';

export default class M20SpecialEmblemFrame extends CardFrame.with(
    Border
) {
    static matches() {
        return true;
    }

    resolveSpecialAssetPath(path) {
        return new URL(`../assets/${path}`, import.meta.url).pathname;
    }

    // --- LAYOUT ---
    get artDimensions() {
        return { width: 343, height: 471 };
    }

    // --- BORDER ---
    get borderMaskUrl() {
        return this.resolveSpecialAssetPath('mask/border/normal.png');
    }
}
