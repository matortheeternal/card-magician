const WalkerAbilitiesMixin = {
    resolveCostIcon(type) {
        return this.resolveWalkerAssetPath(`loyalty/${type}.png`);
    },

    async resolveAbilities() {
        const style = {
            '--walker-ability-plus-bg': `url("${this.resolveCostIcon('plus')}")`,
            '--walker-ability-minus-bg': `url("${this.resolveCostIcon('minus')}")`,
            '--walker-ability-zero-bg': `url("${this.resolveCostIcon('zero')}")`,
        };
        return { id: 'walker-ability', style };
    }
};

export default {
    group: 'vars',
    resolve: 'resolveAbilities',
    mixin: WalkerAbilitiesMixin
};
