import CardFrame from '../../Frame/src/CardFrame.js';
import Frame from '../../Frame/src/mixins/Frame.js';
import Border from '../../Frame/src/mixins/Border.js';
import LandSymbol from './mixins/LandSymbol.js';

export default class LandFrame extends CardFrame.with(
    Frame,
    Border,
    LandSymbol,
) {
    static matches(card) {
        return card.frame === 'basic';
    }

    get artDimensions() {
        return { width: 345, height: 468 };
    }

    resolveLandAssetPath(path) {
        return new URL(`../assets/${path}`, import.meta.url).pathname;
    }

    // --- FRAME ---
    get frameHasLandTemplates() {
        return false;
    }

    get frameExt() {
        return '.png';
    }

    get frameSubFolder() {
        return 'basic';
    }

    get frameFolder() {
        return this.resolveLandAssetPath(`frame/${this.frameSubFolder}`);
    }

    get frameId() {
        return 'basic';
    }

    maskFrame(image) {
        return image;
    }
}
