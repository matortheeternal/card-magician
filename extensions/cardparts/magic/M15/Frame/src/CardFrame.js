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
    static with(...mixins) {
        class Mixed extends this {}

        for (const { mixin } of mixins) {
            Object.defineProperties(
                Mixed.prototype,
                Object.getOwnPropertyDescriptors(mixin)
            );
        }

        Mixed.prototype.mixins = mixins;
        return Mixed;
    }

    constructor(card, module) {
        this.card = card;
        this.ctx = module;
    }

    get artDimensions() {
        if (this.card.artSize === 'frameless')
            return { width: 343, height: 471 };
        if (this.card.artSize === 'borderless')
            return { width: 375, height: 467 };
        return{ width: 316, height: 223 };
    }

    get isLand() {
        return this.card.isLand?.() || this.card?.colorIdentity?.isLand();
    }

    get isArtifact() {
        return this.card.isArtifact?.() || this.card?.colorIdentity?.isArtifact();
    }

    resolveAssetPath(path) {
        return new URL(`../assets/${path}`, import.meta.url).pathname;
    }

    resolveMixinsGroup(group) {
        return this.mixins.filter(m => m.group === group);
    }

    beforeBuild() {
        this.zIndex = 0;
    }

    async buildBackgrounds(group, card) {
        this.beforeBuild();
        const backgrounds = [];
        for (const mixin of (this.resolveMixinsGroup(group) || [])) {
            const resolve = this[mixin.resolve];
            if (typeof resolve !== 'function')
                throw new Error(`Missing resolver ${mixin.resolve}`);
            const result = await resolve.call(this, card);
            const bgs = Array.isArray(result) ? result : [result];
            backgrounds.push(...bgs);
        }
        return backgrounds.filter(Boolean);
    }

    async background(id, image, zIndex) {
        const imageUrl = typeof image === 'string' ? image : await image.publish();
        const backgroundImage = `url('${imageUrl}')`;
        const style = { backgroundImage, zIndex: zIndex || this.zIndex++ };
        return { id, style };
    }

    resolveColorKey(folder, key, options) {
        const isLand = this.isLand && options.hasLandTemplates;
        const landSuffix = isLand ? 'l' : '';
        const isArtifactLand = key === 'a' && isLand;
        const fixedKey = isArtifactLand ? 'cl' : key + landSuffix;
        return `${folder}/${fixedKey}${options.ext}`;
    }

    getHybridOrder(card, c1, c2) {
        const order = [c1, c2];
        const reverseOverride = Boolean(card.hybridStyle?.includes('reverse'));
        if (xor(reverseByDefault.includes(c1 + c2), reverseOverride))
            return order.reverse();
        return order;
    }

    resolveHybridColored(folder, card, options) {
        const colors = card.colorIdentity.colors;
        if (card.colorIdentity.isHybrid() && options.hybridMode === 'colorless')
            return this.resolveColorKey(folder, 'c', options);
        if (card.colorIdentity.isHybrid() && options.hybridMode === 'multicolor')
            return this.resolveColorKey(folder, 'm', options);
        if (card.colorIdentity.isHybrid() && options.hybridMode === 'first')
            return this.resolveColorKey(folder, colors[0].char, options);
        const [c1, c2] = this.getHybridOrder(card, colors[0].char, colors[1].char);
        const blendCoords = options.blendCoords || (
            this.card.hybridStyle?.includes('vertical')
                ? [0, 0.4, 0, 0.6]
                : [0.4, 0, 0.6, 0]
        );
        return this.ctx.linearBlend(
            this.resolveColorKey(folder, c1, options),
            this.resolveColorKey(folder, c2, options),
            ...blendCoords
        );
    }

    resolveColored(folder, card, options = {}) {
        options = {...defaultColoredOptions, ...options};
        const colors = card.colorIdentity.colors;
        return colors.length === 2
            ? this.resolveHybridColored(folder, card, options)
            : this.resolveColorKey(folder, card.getCardColorKey(), options);
    }

    applyMaskedBlends(base, ...blendMasks) {
        let img = base;
        for (const [base, mask] of blendMasks.filter(Boolean))
            img = this.ctx.maskedBlend(img, base, mask);
        return img;
    }

    get useLandHybridBlend() {
        return Boolean(this.blendMaskFolder)
            && this.isLand
            && this.card.hybridBlendStyle !== 'hybrid'
            && this.card.colorIdentity?.colors?.length === 2;
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
            && !this.isLand;
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
        return Boolean(this.blendMaskFolder) && this.isArtifact && !this.isLand;
    }

    get artifactBlendMaskUrl() {
        return `${this.blendMaskFolder}/blend_artifact.png`;
    }

    coloredBlend(folder, card, options = {}) {
        options = {...defaultColoredOptions, ...options};
        const base = this.resolveColored(folder, card, options);
        this.blendMaskFolder = options.blendMaskFolder;
        return this.applyMaskedBlends(
            base,
            this.useLandHybridBlend && [
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

    applyMasks(base, masks) {
        let img = base;
        for (const mask of masks.filter(Boolean))
            img = this.ctx.maskImage(img, mask);
        return img;
    }
}
