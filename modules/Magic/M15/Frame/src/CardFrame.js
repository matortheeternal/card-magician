const defaultColoredOptions = {
    ext: '.jpg',
    hybridMode: 'hybrid',
    hasLandTemplates: false
};

const reverseByDefault = ['wr', 'wg', 'ug'];

function xor(x, y) {
    return (x && !y) || (!x && y);
}

export default class CardFrame {
    constructor(card, module) {
        this.card = card;
        this.ctx = module;
    }

    async buildBackgrounds(key, card) {
        this.zIndex = 0;
        const backgrounds = [];
        for (const f of (this[key] || [])) {
            const bg = await f.call(this, card);
            backgrounds.push(bg);
        }
        return backgrounds.filter(Boolean);
    }

    background(id, imageUrl, zIndex) {
        const backgroundImage = `url('${imageUrl}')`;
        const style = { backgroundImage, zIndex: zIndex || this.zIndex++ };
        return { id, style };
    }

    resolveColorKey(folder, key, options) {
        const landSuffix = (this.card.isLand?.()
            && options.hasLandTemplates
            && key !== 'a') ? 'l' : '';
        return `${folder}/${key}${landSuffix}${options.ext}`;
    }

    getHybridOrder(card, c1, c2) {
        let order = [c1, c2];
        const reverseOverride = Boolean(card.hybridStyle?.includes('reverse'));
        if (xor(reverseByDefault.includes(c1 + c2), reverseOverride))
            return order.reverse();
        return order;
    }

    async resolveHybridColored(folder, card, options) {
        const colors = card.colorIdentity.colors;
        if (card.colorIdentity.isHybrid() && options.hybridMode === 'colorless')
            return this.resolveColorKey(folder, 'c', options);
        if (card.colorIdentity.isHybrid() && options.hybridMode === 'multicolor')
            return this.resolveColorKey(folder, 'm', options);
        if (card.colorIdentity.isHybrid() && options.hybridMode === 'first')
            return this.resolveColorKey(folder, colors[0].char, options);
        const [c1, c2] = this.getHybridOrder(card, colors[0].char, colors[1].char);
        const blendCoords = card.hybridStyle?.includes('vertical')
            ? [0, 0.4, 0, 0.6]
            : [0.4, 0, 0.6, 0];
        return await this.ctx.linearBlend(
            this.resolveColorKey(folder, c1, options),
            this.resolveColorKey(folder, c2, options),
            ...blendCoords
        );
    }

    async resolveColored(folder, card, options = {}) {
        options = {...defaultColoredOptions, ...options};
        const colors = card.colorIdentity.colors;
        return colors.length === 2
            ? await this.resolveHybridColored(folder, card, options)
            : this.resolveColorKey(folder, card.getCardColorKey(), options);
    }

    async applyMaskedBlends(baseUrl, ...blendMasks) {
        let imgUrl = baseUrl;
        for (const [baseUrl, maskUrl] of blendMasks.filter(Boolean))
            imgUrl = await this.ctx.maskedBlend(imgUrl, baseUrl, maskUrl);
        return imgUrl;
    }

    get useLandBlend() {
        return Boolean(this.blendMaskFolder)
            && this.card.isLand?.()
            && this.card.hybridBlendStyle !== 'hybrid'
            && this.card.colorIdentity?.isMulticolor();
    }

    get hybridBlendKey() {
        return (this.card.hybridBlendStyle === 'gold') ? 'm' : 'c';
    }

    get landBlendMaskUrl() {
        return this.hybridBlendMaskUrl;
    }

    get useMulticolorBlend() {
        return Boolean(this.blendMaskFolder)
            && this.card.colorIdentity?.isMulticolor()
            && !this.card.isLand?.();
    }

    get multicolorBlendMaskUrl() {
        return `${this.blendMaskFolder}/blend_multicolor.png`;
    }

    get useHybridBlend() {
        return Boolean(this.blendMaskFolder)
            && this.card.hybridBlendStyle !== 'hybrid'
            && this.card.colorIdentity?.isHybrid();
    }

    get hybridBlendMaskUrl() {
        return `${this.blendMaskFolder}/blend_hybrid.png`;
    }

    get useArtifactBlend() {
        return Boolean(this.blendMaskFolder)
            && this.card.isArtifact?.();
    }

    get artifactBlendMaskUrl() {
        return `${this.blendMaskFolder}/blend_artifact.png`;
    }

    async coloredBlend(folder, card, options = {}) {
        options = {...defaultColoredOptions, ...options};
        const baseUrl = await this.resolveColored(folder, card, options);
        this.blendMaskFolder = options.blendMaskFolder;
        return await this.applyMaskedBlends(baseUrl,
            this.useLandBlend && [
                `${folder}/${this.hybridBlendKey}${options.ext}`,
                this.landBlendMaskUrl
            ],
            this.useMulticolorBlend && [
                `${folder}/m${options.ext}`,
                this.multicolorBlendMaskUrl
            ],
            this.useHybridBlend && [
                `${folder}/${this.hybridBlendKey}${options.ext}`,
                this.hybridBlendMaskUrl
            ],
            this.useArtifactBlend && [
                `${folder}/a${options.ext}`,
                this.artifactBlendMaskUrl
            ]
        );
    }

    async applyMasks(baseUrl, masks) {
        let imgUrl = baseUrl;
        for (const maskUrl of masks.filter(Boolean))
            imgUrl = await this.ctx.maskImage(imgUrl, maskUrl);
        return imgUrl;
    }
}
