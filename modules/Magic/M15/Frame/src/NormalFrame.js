import CardFrame from './CardFrame.js';

function resolveAssetPath(path) {
    return new URL(`../assets/${path}`, import.meta.url).pathname;
}

export default class NormalFrame extends CardFrame {
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
        this.resolveMiracleTrim
    ];

    pt = [this.resolvePt];

    async buildBackgrounds(key, card) {
        this.numTrims = 0;
        return await super.buildBackgrounds(key, card);
    }

/*
    get isExpanded() {
        return this.card.usesExpandedArt?.() || this.card.isPuma?.();
    }

    get isMaxArt() {
        return this.card.isBorderless?.() && this.card.isFrameless?.();
    }

    get crownMasks() {
        const masks = super.crownMasks;
        if (this.isMaxArt() && this.card.isMiracle())
            masks.push('mask/crown/miracle_borderless.png');
        if (this.isExpanded && this.card.hasAlias?.())
            masks.push('mask/crown/expanded_alias.png');
        return masks;
    }
 */

    // --- FRAME RESOLUTION ---
    get frameExt() {
        return '.jpg';
    }

    get frameMaskFolder() {
        return resolveAssetPath('mask/frame');
    }

    get frameSubfolder() {
        if (this.card.isFrontDFC?.() && this.card.isTransform?.())
            return 'notched';
        if (this.card.id === 'back')
            return 'back';
        if (this.card.hasFaceSymbol())
            return 'front';
        return 'normal';
    }

    get frameFolder() {
        return resolveAssetPath(`frame/${this.frameSubfolder}`);
    }

    get frameMaskFilename() {
        return 'normal.png';
    }

    get frameHasLandTemplates() {
        return true;
    }

    get frameBlendMaskFolder() {
        return resolveAssetPath('mask/normal');
    }

    async maskFrame(imageUrl) {
        const maskUrl = `${this.frameMaskFolder}/${this.frameMaskFilename}`
        return await this.ctx.maskImage(imageUrl, maskUrl);
    }

    async resolveFrame(card) {
        const imageUrl = await this.coloredBlend(this.frameFolder, card, {
            ext: this.frameExt,
            blendMaskFolder: this.frameBlendMaskFolder,
            hasLandTemplates: this.frameHasLandTemplates
        });
        const maskedUrl = await this.maskFrame(imageUrl);
        return this.background('normal', maskedUrl);
    }

    // --- TRIM MASK RESOLUTION ---
    get trimMaskFilename() {
        return 'normal.png';
    }

    get trimMaskUrl() {
        const folder = this.numTrims > 0 ? 'doubletrim' : 'trim';
        this.numTrims += 1;
        return resolveAssetPath(`mask/${folder}/${this.trimMaskFilename}`);
    }

    async maskTrim(imageUrl) {
        return await this.ctx.maskImage(imageUrl, this.trimMaskUrl);
    }

    // --- CROWNS ---
    get crownFolder() {
        return resolveAssetPath('element/crown/normal');
    }

    get crownMasks() {
        const masks = [];
        if (this.card.hasFaceSymbol?.())
            masks.push(resolveAssetPath('mask/crown/face_symbol.png'));
        return masks;
    }

    get crownBlendMaskFolder() {
        return resolveAssetPath('mask/crown');
    }

    async resolveCrown(card) {
        if (!card.isLegendary?.()) return null;
        const imageUrl = await this.coloredBlend(this.crownFolder, card, {
            ext: '.png',
            blendMaskFolder: this.crownBlendMaskFolder
        });
        const maskedUrl = await this.applyMasks(imageUrl, this.crownMasks);
        return this.background('crown', maskedUrl);
    }

    // --- VEHICLE TRIM ---
    get vehicleTrimUrl() {
        return resolveAssetPath('element/vehicle/trim.png');
    }

    async resolveVehicleTrim(card) {
        if (!card.isVehicle?.()) return null;
        const maskedUrl = await this.maskTrim(this.vehicleTrimUrl);
        return this.background('vehicle-trim', maskedUrl);
    }

    // --- NYX TRIM ---
    get nyxFolder() {
        return resolveAssetPath('element/nyx');
    }

    get nyxBlendMaskFolder() {
        return resolveAssetPath('mask/nyx');
    }

    async resolveNyxTrim(card) {
        if (!card.isEnchantment?.()) return null;
        const imageUrl = await this.coloredBlend(this.nyxFolder, card, {
            ext: '.png',
            blendMaskFolder: this.nyxBlendMaskFolder
        });
        const maskedUrl = await this.maskTrim(imageUrl);
        return this.background('nyx-trim', maskedUrl);
    }

    // --- SNOW TRIM ---
    get snowFolder() {
        return resolveAssetPath('element/snow');
    }

    get snowBlendMaskFolder() {
        return resolveAssetPath('mask/snow');
    }

    async resolveSnowTrim(card) {
        if (!card.isSnow?.()) return null;
        const imageUrl = await this.coloredBlend(this.snowFolder, card, {
            ext: '.png',
            blendMaskFolder: this.snowBlendMaskFolder,
            hasLandTemplates: true
        });
        const maskedUrl = await this.maskTrim(imageUrl);
        return this.background('snow-trim', maskedUrl);
    }

    // --- BORDER ---
    get borderMaskUrl() {
        return this.card.isLegendary?.()
            ? resolveAssetPath('mask/border/crown.png')
            : resolveAssetPath('mask/border/base.png');
    }

    async resolveBorder(card) {
        const borderColor = card.borderColor || '#000000';
        const maskedUrl = await this.ctx.maskColor(this.borderMaskUrl, borderColor);
        return this.background('border', maskedUrl);
    }

    // --- MIRACLE TRIM ---
    get miracleSubFolder() {
        return this.card.isSnow?.() ? 'snow' : 'normal';
    }

    get miracleFolder() {
        return resolveAssetPath(`element/miracle/${this.miracleSubFolder}`);
    }

    get miracleBlendMaskFolder() {
        return resolveAssetPath('mask/miracle');
    }

    async resolveMiracleTrim(card) {
        if (!card.isMiracle?.()) return null;
        const imageUrl = await this.coloredBlend(this.miracleFolder, card, {
            ext: '.png',
            blendMaskFolder: this.miracleBlendMaskFolder
        });
        return this.background('miracle-trim', imageUrl);
    }

    // --- PT ---
    get ptFolder() {
        return resolveAssetPath('element/pt');
    }

    async resolvePt(card) {
        const imageUrl = card.isVehicle?.()
            ? `${this.ptFolder}/vehicle.png`
            : await this.resolveColored(this.ptFolder, card, {
                ext: '.png',
                hybridMode: 'colorless'
            });
        return this.background('pt', imageUrl);
    }
}
