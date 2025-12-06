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
        this.resolveDraftTrim,
        this.resolveNyxTrim,
        this.resolveBorder,
        this.resolveScrolls,
        this.resolveNode,
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
    get artDimensions() {
        return { width: 316, height: 223 };
    }

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
        if (this.card.isBackDFC?.())
            return 'back';
        if (this.card.hasFaceSymbol() || this.card.isFrontDFC?.())
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

    get frameId() {
        return 'normal';
    }

    async resolveFrame(card) {
        const imageUrl = await this.coloredBlend(this.frameFolder, card, {
            ext: this.frameExt,
            blendMaskFolder: this.frameBlendMaskFolder,
            hasLandTemplates: this.frameHasLandTemplates
        });
        const maskedUrl = await this.maskFrame(imageUrl);
        return this.background(this.frameId, maskedUrl);
    }

    // --- TRIM MASKS ---
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
    get showCrown() {
        return (this.card.crownStyle !== 'disabled')
            && (this.card.crownStyle !== 'auto' || this.card.isLegendary?.());
    }

    get brawlCrownSubfolder() {
        return this.card.hasFaceSymbol?.() ? 'brawl_with_face_symbol' : 'brawl';
    }

    get autoCrownSubfolder() {
        if (this.showNyxTrim) return 'nyx';
        if (this.card.isCompanion?.()) return 'companion';
        if (this.card.isBrawl?.()) return this.brawlCrownSubfolder;
        return 'normal';
    }

    get crownSubfolder() {
        if (this.card.crownStyle === 'auto') return this.autoCrownSubfolder;
        if (this.card.crownStyle === 'brawl') return this.brawlCrownSubfolder;
        return this.card.crownStyle;
    }

    get crownFolder() {
        let subfolder = this.crownSubfolder;
        if (this.card.isShifted?.() && !subfolder.startsWith('brawl'))
            subfolder = `shifted/${subfolder}`;
        return resolveAssetPath(`element/crown/${subfolder}`);
    }

    get crownMasks() {
        const masks = [];
        if (this.card.hasFaceSymbol?.())
            masks.push(resolveAssetPath('mask/crown/face_symbol.png'));
        return masks;
    }

    get crownBlendMaskSubfolder() {
        const subfolder = this.crownSubfolder;
        if (subfolder.startsWith('brawl')) return 'normal';
        return this.card.isShifted?.()
            ? `shifted/${subfolder}`
            : subfolder;
    }

    get crownBlendMaskFolder() {
        return resolveAssetPath(`mask/crown/${this.crownBlendMaskSubfolder}`);
    }

    async resolveCrown(card) {
        if (!this.showCrown) return null;
        const imageUrl = await this.coloredBlend(this.crownFolder, card, {
            ext: '.png',
            blendMaskFolder: this.crownBlendMaskFolder
        });
        const maskedUrl = await this.applyMasks(imageUrl, this.crownMasks);
        return this.background('crown', maskedUrl);
    }

    // --- VEHICLE TRIM ---
    get showVehicleTrim() {
        return (this.card.vehicleStyle !== 'disabled')
            && (this.card.vehicleStyle !== 'auto' || this.card.isVehicle?.());
    }

    get vehicleTrimUrl() {
        return resolveAssetPath('element/vehicle/trim.png');
    }

    async resolveVehicleTrim() {
        if (!this.showVehicleTrim) return null;
        const maskedUrl = await this.maskTrim(this.vehicleTrimUrl);
        return this.background('vehicle-trim', maskedUrl);
    }

    // --- DRAFT TRIM ---
    get showDraftTrim() {
        return (this.card.draftStyle !== 'disabled')
            && (this.card.draftStyle !== 'auto' || this.card.isConspiracy?.());
    }

    get draftFolder() {
        return resolveAssetPath('element/draft');
    }

    get draftBlendMaskFolder() {
        return resolveAssetPath('mask/draft');
    }

    async resolveDraftTrim(card) {
        if (!this.showDraftTrim) return null;
        const imageUrl = await this.coloredBlend(this.draftFolder, card, {
            ext: '.png',
            blendMaskFolder: this.draftBlendMaskFolder
        });
        const maskedUrl = await this.maskTrim(imageUrl);
        return this.background('draft-trim', maskedUrl);
    }

    // --- NYX TRIM ---
    get showNyxTrim() {
        return (this.card.nyxStyle !== 'disabled')
            && (this.card.nyxStyle !== 'auto' || this.card.isEnchantment?.());
    }

    get autoNyxSubfolder() {
        if (this.card.isCompanion?.()) return 'companion';
        if (this.card.isShifted?.()) return 'shifted';
        return 'normal';
    }

    get nyxSubfolder() {
        return this.card.nyxStyle === 'auto'
            ? this.autoNyxSubfolder
            : this.card.nyxStyle;
    }

    get nyxFolder() {
        return resolveAssetPath(`element/nyx/${this.nyxSubfolder}`);
    }

    get nyxBlendMaskSubfolder() {
        if (this.nyxSubfolder === 'star') return 'star';
        return 'normal';
    }

    get nyxBlendMaskFolder() {
        return resolveAssetPath(`mask/nyx/${this.nyxBlendMaskSubfolder}`);
    }

    async resolveNyxTrim(card) {
        if (!this.showNyxTrim) return null;
        const imageUrl = await this.coloredBlend(this.nyxFolder, card, {
            ext: '.png',
            blendMaskFolder: this.nyxBlendMaskFolder
        });
        const maskedUrl = await this.maskTrim(imageUrl);
        return this.background('nyx-trim', maskedUrl);
    }

    // --- SNOW TRIM ---
    get showSnowTrim() {
        return (this.card.snowStyle !== 'disabled')
            && (this.card.snowStyle !== 'auto' || this.card.isSnow?.());
    }

    get snowFolder() {
        return resolveAssetPath('element/snow');
    }

    get snowBlendMaskFolder() {
        return resolveAssetPath('mask/snow');
    }

    async resolveSnowTrim(card) {
        if (!this.showSnowTrim) return null;
        const imageUrl = await this.coloredBlend(this.snowFolder, card, {
            ext: '.png',
            blendMaskFolder: this.snowBlendMaskFolder,
            hasLandTemplates: true
        });
        const maskedUrl = await this.maskTrim(imageUrl);
        return this.background('snow-trim', maskedUrl);
    }

    // --- BORDER ---
    get borderMaskFilename() {
        return this.showCrown ? 'crown.png' : 'base.png';
    }

    get borderMaskFolder() {
        return 'mask/border';
    }

    get borderMaskUrl() {
        return resolveAssetPath(`${this.borderMaskFolder}/${this.borderMaskFilename}`);
    }

    async resolveBorder(card) {
        const borderColor = card.borderColor || '#000000';
        const maskedUrl = await this.ctx.maskColor(this.borderMaskUrl, borderColor);
        return this.background('border', maskedUrl);
    }

    // --- SCROLLS ---
    get showScrolls() {
        return (this.card.scrollsStyle !== 'disabled')
            && (this.card.scrollsStyle !== 'auto' || this.card.isConspiracy?.());
    }

    get scrollsFilename() {
        if (this.card.isMiracle?.()) return 'miracle.png';
        return 'normal.png';
    }

    get scrollsUrl() {
        return resolveAssetPath(`element/scrolls/${this.scrollsFilename}`);
    }

    async resolveScrolls() {
        if (!this.showScrolls) return null;
        return this.background('conspiracy-scrolls', this.scrollsUrl);
    }

    // --- NODE ---
    get showNode() {
        return this.card.isDFC() || this.card.hasFaceSymbol?.();
    }

    get nodeSubfolder() {
        if (this.card.isShifted?.()) return 'shifted';
        return 'normal';
    }

    get nodeFolder() {
        return resolveAssetPath(`element/node/${this.nodeSubfolder}`);
    }

    get nodeBlendMaskFolder() {
        return resolveAssetPath(`mask/node`);
    }

    async resolveNode(card) {
        if (!this.showNode) return null;
        const imageUrl = await this.coloredBlend(this.nodeFolder, card, {
            ext: '.png',
            blendMaskFolder: this.nodeBlendMaskFolder
        });
        return this.background('node', imageUrl);
    }

    // --- MIRACLE TRIM ---
    get showMiracleTrim() {
        return (this.card.miracleStyle !== 'disabled') &&
            (this.card.miracleStyle !== 'auto' || this.card.isMiracle?.());
    }

    get miracleSubfolder() {
        return this.card.isSnow?.() ? 'snow' : 'normal';
    }

    get miracleFolder() {
        return resolveAssetPath(`element/miracle/${this.miracleSubfolder}`);
    }

    get miracleBlendMaskFolder() {
        return resolveAssetPath('mask/miracle');
    }

    async resolveMiracleTrim(card) {
        if (!this.showMiracleTrim) return null;
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

    getPtKey(card) {
        if (this.showVehicleTrim) return 'vehicle';
        if (card.colorIdentity.isHybrid()) return 'c';
        return card.getCardColorKey();
    }

    async resolvePt(card) {
        const imageUrl = `${this.ptFolder}/${this.getPtKey(card)}.png`;
        return this.background('pt', imageUrl);
    }
}
