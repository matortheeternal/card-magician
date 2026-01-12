import NormalFrame from '../../../M15/Frame/src/NormalFrame.js';

function resolveAssetPath(path) {
    return new URL(`../assets/${path}`, import.meta.url).pathname;
}

export default class M20TokenFrame extends NormalFrame {
    static matches() {
        return true;
    }

    frame = [
        this.resolveFrame,
        this.resolveVehicleTrim,
        this.resolveSnowTrim,
        this.resolveNyxTrim,
        this.resolveBorder,
        this.resolveCrown,
    ];

    // --- LAYOUT ---
    get artDimensions() {
        return { width: 343, height: 471 };
    }

    get frameHeight() {
        if (this.card.hasNoText?.())
            return 'short';
        if (this.card.isTall?.())
            return 'tall';
        return 'normal';
    }

    // --- FRAME RESOLUTION ---
    get frameExt() {
        return '.png';
    }

    get frameFolder() {
        return resolveAssetPath(`frame/${this.frameHeight}`);
    }

    get frameMaskFilename() {
        return `${this.frameHeight}.png`;
    }

    get frameHasLandTemplates() {
        return false;
    }

    get frameBlendMaskFolder() {
        return resolveAssetPath(`mask/${this.frameHeight}`);
    }

    get frameId() {
        return 'token';
    }

    // --- TRIM MASKS ---
    get trimMaskFilename() {
        return `${this.frameHeight}.png`;
    }

    get frameMaskFolder() {
        return resolveAssetPath('mask/frame');
    }

    // TODO: snowbox, snowtype
}
