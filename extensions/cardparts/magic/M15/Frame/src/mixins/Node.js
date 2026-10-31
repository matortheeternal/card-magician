const NodeMixin = {
    get showNode() {
        return this.card.isDFC() || this.card.hasFaceSymbol?.();
    },

    get nodeSubfolder() {
        if (this.card.frame === 'planeshifted') return 'shifted';
        return 'standard';
    },

    get nodeFolder() {
        return this.resolveAssetPath(`element/node/${this.nodeSubfolder}`);
    },

    get nodeBlendMaskFolder() {
        return this.resolveAssetPath(`mask/node`);
    },

    async resolveNode(card) {
        if (!this.showNode) return null;
        const image = this.coloredBlend(this.nodeFolder, card, {
            ext: '.png',
            blendMaskFolder: this.nodeBlendMaskFolder
        });
        return this.background('node', image);
    },
};

export default {
    group: 'frame',
    resolve: 'resolveNode',
    mixin: NodeMixin
};
