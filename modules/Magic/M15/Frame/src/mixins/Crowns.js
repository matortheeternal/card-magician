const CrownMixin = {
    get showCrown() {
        return (this.card.crownStyle !== 'disabled')
            && (this.card.crownStyle !== 'auto' || this.card.isLegendary?.());
    },

    get brawlCrownSubfolder() {
        return this.card.hasFaceSymbol?.() ? 'brawl_with_face_symbol' : 'brawl';
    },

    get autoCrownSubfolder() {
        if (this.showNyxTrim) return 'nyx';
        if (this.card.isCompanion?.()) return 'companion';
        if (this.card.isBrawl?.()) return this.brawlCrownSubfolder;
        return 'normal';
    },

    get crownSubfolder() {
        if (this.card.crownStyle === 'auto') return this.autoCrownSubfolder;
        if (this.card.crownStyle === 'brawl') return this.brawlCrownSubfolder;
        return this.card.crownStyle;
    },

    get crownFolder() {
        let subfolder = this.crownSubfolder;
        if (this.card.isShifted?.() && !subfolder.startsWith('brawl'))
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
        if (subfolder.startsWith('brawl')) return 'normal';
        return this.card.isShifted?.()
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
