const PTMixin = {
    get ptSubfolder() {
        if (this.card.isStation?.()) return 'spacecraft';
        return this.card.isBackDFC?.() ? 'back' : 'standard';
    },

    get ptFolder() {
        return this.resolveAssetPath(`element/pt/${this.ptSubfolder}`);
    },

    getPtKey(card) {
        if (card.colorIdentity.isHybrid()) return 'c';
        return card.getCardColorKey();
    },

    getPtPath(card) {
        if (this.showVehicleTrim)
            return this.resolveAssetPath(`element/pt/vehicle.png`);
        return `${this.ptFolder}/${this.getPtKey(card)}.png`;
    },

    async resolvePt(card) {
        const image = this.getPtPath(card);
        const style = { '--pt-background': `url("${image}")` };
        return { id: 'pt', style };
    },
};

export default {
    group: 'vars',
    resolve: 'resolvePt',
    mixin: PTMixin
};
