const PTMixin = {
    get ptSubfolder() {
        return this.card.isBackDFC?.() ? 'back' : 'normal';
    },

    get ptFolder() {
        return this.resolveAssetPath(`element/pt/${this.ptSubfolder}`);
    },

    getPtKey(card) {
        if (card.colorIdentity.isHybrid()) return 'c';
        return card.getCardColorKey();
    },

    gtPtPath(card) {
        if (this.showVehicleTrim)
            return this.resolveAssetPath(`element/pt/vehicle.png`);
        return `${this.ptFolder}/${this.getPtKey(card)}.png`;
    },

    async resolvePt(card) {
        const image = this.gtPtPath(card);
        return this.background('pt', image);
    },
};

export default {
    group: 'pt',
    resolve: 'resolvePt',
    mixin: PTMixin
};
