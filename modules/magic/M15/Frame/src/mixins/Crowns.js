const CrownMixin = {
    get showCrown() {
        return this.card.crownStyle !== 'disabled';
    },

    get brawlCrownSubfolder() {
        return this.card.hasFaceSymbol?.() ? 'brawl_with_face_symbol' : 'brawl';
    },

    get crownSubfolder() {
        if (this.card.crownStyle === 'brawl')
            return this.brawlCrownSubfolder;
        return this.card.crownStyle;
    },

    get crownFolder() {
        if (this.card.artSize === 'borderless' || this.card.artSize === 'frameless')
            return this.resolveAssetPath('element/crown/borderless');
        let subfolder = this.crownSubfolder;
        if (this.card.frame === 'planeshifted' && !subfolder.startsWith('brawl'))
            subfolder = `shifted/${subfolder}`;
        return this.resolveAssetPath(`element/crown/${subfolder}`);
    },

    get crownMasks() {
        const masks = [];
        if (this.card.hasFaceSymbol?.())
            masks.push(this.resolveAssetPath('mask/crown/face_symbol.png'));
        return masks;
    },

    get crownBlendMaskSubfolder() {
        const subfolder = this.crownSubfolder;
        if (subfolder.startsWith('brawl')) return 'standard';
        return this.card.frame === 'planeshifted'
            ? `shifted/${subfolder}`
            : subfolder;
    },

    get crownBlendMaskFolder() {
        return this.resolveAssetPath(`mask/crown/${this.crownBlendMaskSubfolder}`);
    },

    async resolveCrown(card) {
        if (!this.showCrown) return null;
        const image = this.coloredBlend(this.crownFolder, card, {
            ext: '.png',
            blendMaskFolder: this.crownBlendMaskFolder
        });
        const maskedImg = this.applyMasks(image, this.crownMasks);
        return this.background('crown', maskedImg);
    },
};

export default {
    group: 'frame',
    resolve: 'resolveCrown',
    mixin: CrownMixin
};
