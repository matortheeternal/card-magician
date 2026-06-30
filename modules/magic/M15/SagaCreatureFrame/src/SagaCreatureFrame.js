import CardFrame from '../../Frame/src/CardFrame.js';
import Frame from '../../Frame/src/mixins/Frame.js';
import Border from '../../Frame/src/mixins/Border.js';
import Crowns from '../../Frame/src/mixins/Crowns.js';
import PT from '../../Frame/src/mixins/PT.js';

export default class SagaCreatureFrame extends CardFrame.with(
    Frame,
    Border,
    Crowns,
    PT,
) {
    static matches() {
        return true;
    }

    get artDimensions() {
        return { width: 157, height: 283 };
    }

    resolveSagaAssetPath(path) {
        return new URL(`../assets/${path}`, import.meta.url).pathname;
    }

    // --- FRAME ---
    get frameId() {
        return 'saga-creature';
    }

    get frameExt() {
        return '.png';
    }

    get frameHasLandTemplates() {
        return false;
    }

    get useHybridBlend() {
        return false;
    }

    get frameMaskFolder() {
        return this.resolveSagaAssetPath('mask/frame');
    }

    get frameMaskFilename() {
        return 'standard.png';
    }

    get frameBlendMaskFolder() {
        return this.resolveSagaAssetPath('mask/saga');
    }

    get frameFolder() {
        return this.resolveSagaAssetPath('frame/standard');
    }
}
