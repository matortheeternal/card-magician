const WalkerAbilitiesMixin = {
    async resolveAbility(type) {
        return this.resolveWalkerAssetPath(`loyalty/${type}.png`);
    },

    async resolveAbilities() {
        const style = {
            '--walker-ability-plus-bg': `url("${await this.resolveAbility('plus')}")`,
            '--walker-ability-minus-bg': `url("${await this.resolveAbility('minus')}")`,
            '--walker-ability-zero-bg': `url("${await this.resolveAbility('zero')}")`,
        };
        return { id: 'walker-ability', style };
    },
};

export default {
    group: 'vars',
    resolve: 'resolveAbilities',
    mixin: WalkerAbilitiesMixin
};
