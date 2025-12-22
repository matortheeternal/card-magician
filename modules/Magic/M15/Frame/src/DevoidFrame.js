import NormalFrame from './NormalFrame.js';

function resolveAssetPath(path) {
    return new URL(`../assets/${path}`, import.meta.url).pathname;
}

export default class DevoidFrame extends NormalFrame {
    static matches(card) {
        return card.frame === 'devoid';
    }

    frame = [
        this.resolveFrame,
        this.resolveVehicleTrim,
        this.resolveSnowTrim,
        this.resolveDraftTrim,
        this.resolveNyxTrim,
        this.resolveBorder,
        this.resolveCrown,
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

    maskFrame(imageUrl) {
        const maskUrl = resolveAssetPath('mask/frame/clear.png');
        return this.ctx.maskImage(imageUrl, maskUrl);
    }

    get frameId() {
        return 'devoid';
    }

    /* --- TRIM MASKS --- */
    get devoidTrimMaskUrl() {
        return resolveAssetPath('mask/trim/devoid.png');
    }

    maskTrim(imageUrl) {
        const maskedImg = super.maskTrim(imageUrl);
        if (!this.card.other.avoidCoveringDevoid) return maskedImg;
        return this.ctx.maskImage(maskedImg, this.devoidTrimMaskUrl);
    }

    /* --- CROWN --- */
    get crownMasks() {
        const masks = super.crownMasks;
        if (this.card.hasAlias?.())
            masks.push('mask/crown/expanded_alias.png');
        return masks;
    }
}
