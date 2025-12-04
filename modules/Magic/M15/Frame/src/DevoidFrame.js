import NormalFrame from './NormalFrame.js';

function resolveAssetPath(path) {
    return new URL(`../assets/${path}`, import.meta.url).pathname;
}

export default class DevoidFrame extends NormalFrame {
    static matches(card) {
        return card.frame.devoid;
    }

    frame = [
        this.resolveFrame,
        this.resolveBorder,
        this.resolveCrown
    ];

    get artDimensions() {
        return { width: 343, height: 429 };
    }

    /* --- FRAME --- */
    get frameExt() {
        return '.png';
    }

    get frameHasLandTemplates() {
        return false;
    }

    get frameFolder() {
        return resolveAssetPath('frame/devoid');
    }

    async maskFrame(imageUrl) {
        const maskUrl = resolveAssetPath('mask/frame/clear.png');
        return await this.ctx.maskImage(imageUrl, maskUrl);
    }

    /* --- CROWN --- */
    get crownMasks() {
        const masks = super.crownMasks;
        if (this.card.hasAlias?.())
            masks.push('mask/crown/expanded_alias.png');
        return masks;
    }
}
