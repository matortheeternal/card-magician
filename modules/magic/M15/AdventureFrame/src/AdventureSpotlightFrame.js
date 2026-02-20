import CardFrame from '../../Frame/src/CardFrame.js';
import Frame from '../../Frame/src/mixins/Frame.js';
import Border from '../../Frame/src/mixins/Border.js';
import PT from '../../Frame/src/mixins/PT.js';
import LeftPage from './mixins/LeftPage.js';

export default class AdventureSpotlightFrame extends CardFrame.with(
    Frame,
    Border,
    PT,
    LeftPage,
) {
    static matches(card) {
        return card.frame === 'spotlight';
    }

    resolveAdventureAssetPath(path) {
        return new URL(`../assets/${path}`, import.meta.url).pathname;
    }

    get useHybridBlend() {
        return false;
    }

    /* --- FRAME --- */
    get frameHasLandTemplates() {
        return false;
    }

    get frameExt() {
        return '.png';
    }

    get frameFolder() {
        return this.resolveAdventureAssetPath('frame/spotlight');
    }

    maskFrame(imageUrl) {
        return imageUrl;
    }

    get frameId() {
        return 'spotlight';
    }

    /* --- BORDER --- */
    get borderMaskFilename() {
        return 'base.png';
    }

    /* --- PT --- */
    get ptFolder() {
        return this.resolveAdventureAssetPath('pt');
    }

    /* --- LEFT PAGE --- */
    get leftPageUrl() {
        return this.resolveAdventureAssetPath('page/spotlight');
    }
}
