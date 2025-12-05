import AdventureFrame from './AdventureFrame.js';

function resolveAssetPath(path) {
    return new URL(`../assets/${path}`, import.meta.url).pathname;
}

export default class AdventureSpotlightFrame extends AdventureFrame {
    static matches(card) {
        return card.frame === 'spotlight';
    }

    frame = [this.resolveFrame, this.resolveBorder];
    pages = [this.resolveLeftPage];

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
        return resolveAssetPath('frame/spotlight');
    }

    async maskFrame(imageUrl) {
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
        return resolveAssetPath('pt');
    }

    /* --- LEFT PAGE --- */
    get leftPageUrl() {
        return resolveAssetPath('page/spotlight');
    }
}
