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
    get ext() {
        return '.jpg';
    }

    get hasLandTemplates() {
        return false;
    }

    /**
     * @abstract
     * @return string
     */
    get maskFolder() {
        throw new Error('Not implemented');
    }

    /**
     * @abstract
     * @return string
     */
    get folder() {
        throw new Error('Not implemented');
    }

    async resolve(key) {
        return await this.assetURL(`${this.folder}/${key}${this.ext}`);
    }
}

export class FrameProvider extends ColoredProvider {
    zIndex = 0;

    get folder() {
        return `frame/${this.card.frameFolder}`;
    }

    get maskFolder() {
        if (this.card.isMap?.()) return 'mask/map';
        if (this.card.isEnergyLand?.()) return 'mask/energy';
        if (this.card.isDKA?.()) return 'mask/dka';
        return 'mask/normal';
    }

    get hasLandTemplates() {
        return this.card.frameFolder !== 'energy';
    }
}

export class CrownProvider extends ColoredProvider {
    zIndex = 8;

    static enabled(card) {
        return card.isLegendary?.();
    }

    get maskFolder() {
        return 'mask/crown';
    }

    get folder() {
        return 'element/crown';
    }

    get subfolder() {
        if (this.card.isEnchantment?.()) return 'nyx';
        if (this.card.isBorderless?.()) return 'borderless';
        if (this.card.isBrawl?.())
            return this.card.hasFaceSymbol?.()
                ? 'brawl_with_face_symbol'
                : 'brawl';
        if (this.card.isCompanion?.()) return 'companion';
        return 'normal';
    }

    async resolve(key) {
        const path = `${this.folder}/${this.subfolder}/${key}.png`;
        return await this.assetURL(path);
    }
}

export class SnowTrimProvider extends ColoredProvider {
    zIndex = 3;

    static enabled(card) {
        return card.isSnow?.();
    }

    get ext() {
        return '.png';
    }

    get isTrim() {
        return true;
    }

    get hasLandTemplates() {
        return true;
    }

    get maskFolder() {
        return 'mask/snow';
    }

    get folder() {
        return 'element/snow';
    }
}

export class VehicleTrimProvider extends Provider {
    zIndex = 4;

    static enabled(card) {
        return card.isVehicle?.();
    }

    get isTrim() {
        return true;
    }

    async resolve() {
        return await this.assetURL('element/vehicle/trim.png');
    }
}

export class NyxTrimProvider extends ColoredProvider {
    zIndex = 5;

    static enabled(card) {
        return card.isEnchantment?.();
    }

    get ext() {
        return '.png';
    }

    get maskFolder() {
        return 'mask/nyx';
    }

    get folder() {
        return 'element/nyx';
    }

    get isTrim() {
        return true;
    }
}

export class BorderProvider extends Provider {
    zIndex = 9;

    async resolve() {
        const borderMaskPath = this.card.isLegendary()
            ? 'mask/border/crown.png'
            : 'mask/border/base.png';
        const maskUrl = await this.assetURL(borderMaskPath);
        return await this.utils.maskColor(maskUrl, '#000000');
    }
}

export class MiracleTrimProvider extends ColoredProvider {
    zIndex = 10;

    static enabled(card) {
        return card.isMiracle?.();
    }

    get maskFolder() {
        return 'mask/miracle';
    }

    get folder() {
        return 'element/miracle';
    }

    get subfolder() {
        if (this.card.isFNM?.()) return 'fnm';
        if (this.card.isInverted?.()) return 'inverted';
        if (this.card.isShifted?.()) return 'shifted';
        if (this.card.isBeyond?.()) return 'beyond';
        if (this.card.isSnow?.()) return 'snow';
        return 'normal';
    }

    async resolve(key) {
        return this.card.isClear?.() || this.card.clearTops?.()
            ? await this.assetURL(`${this.folder}/normal/x.png`)
            : await this.assetURL(`${this.folder}/${this.subfolder}/${key}.png`)
    }
}

export default [
    FrameProvider,
    BorderProvider,
    CrownProvider,
    NyxTrimProvider,
    SnowTrimProvider,
    VehicleTrimProvider,
    MiracleTrimProvider,
]
