/**
 * @abstract
 */
export class Provider {
    zIndex = 0;

    constructor(card, utils) {
        this.card = card;
        this.utils = utils;
    }

    /**
     * @abstract
     * @param card
     * @returns {boolean}
     */
    static enabled(card) {
        return true;
    }

    get isTrim() {
        return false;
    }

    assetURL(path) {
        return this.utils.assetURL(path);
    }
}

export class ColoredProvider extends Provider {
    get hasLandTemplates() {
        return false;
    }

    /**
     * @abstract
     * @return string
     */
    get folder() {
        throw new Error('Not implemented');
    }

    async resolve(key) {
        return await this.assetURL(`${this.folder}/${key}.jpg`);
    }
}

export class FrameProvider extends ColoredProvider {
    zIndex = 0;

    get folder() {
        return this.card.frameFolder;
    }

    get hasLandTemplates() {
        return true;
    }
}

export class CrownProvider extends ColoredProvider {
    zIndex = 1;

    static enabled(card) {
        return card.isLegendary();
    }

    get folder() {
        return this.card.isEnchantment() ? 'crowns/nyx' : 'crowns';
    }
}

export class VehicleTrimProvider extends Provider {
    zIndex = 2;

    static enabled(card) {
        return card.isVehicle();
    }

    get isTrim() {
        return true;
    }

    async resolve() {
        return await this.assetURL('trims/vehicle.png');
    }
}

export class NyxTrimProvider extends ColoredProvider {
    zIndex = 2;

    static enabled(card) {
        return card.isEnchantment();
    }

    get folder() {
        return 'nyx';
    }

    get isTrim() {
        return true;
    }

    async resolve(key) {
        // necessary because nyx trims are PNGs, not JPGs
        return await this.assetURL(`${this.folder}/${key}.png`);
    }
}

export class BorderProvider extends Provider {
    zIndex = 3;

    async resolve() {
        const borderMaskPath = this.card.isLegendary()
            ? 'masks/border/crown.png'
            : 'masks/border/base.png';
        const maskUrl = await this.assetURL(borderMaskPath);
        return await this.utils.maskColor(maskUrl, '#000000');
    }
}

export default [
    FrameProvider,
    CrownProvider,
    VehicleTrimProvider,
    NyxTrimProvider,
    BorderProvider
]
