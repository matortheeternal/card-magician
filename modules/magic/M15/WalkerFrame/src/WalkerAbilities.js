const WalkerAbilitiesMixin = {
    resolveCostIcon(type) {
        return this.resolveWalkerAssetPath(`loyalty/${type}.png`);
    },

    resolveAbilityBorder(type) {
        const source = this.resolveWalkerAssetPath(`stripe/${type}.png`);
        return this.ctx.makeTransparent(source, 0.5).publish();
    },

    async resolveAbilities() {
        const style = {
            '--walker-ability-plus-bg': `url("${this.resolveCostIcon('plus')}")`,
            '--walker-ability-minus-bg': `url("${this.resolveCostIcon('minus')}")`,
            '--walker-ability-zero-bg': `url("${this.resolveCostIcon('zero')}")`,
            '--walker-ability-top-bg': `url("${
                await this.resolveAbilityBorder('top')
            }")`,
            '--walker-ability-base-bg': `url("${
                await this.resolveAbilityBorder('base')
            }")`,
            '--walker-ability-bottom-bg': `url("${
                await this.resolveAbilityBorder('bottom')
            }")`,
        };
        return { id: 'walker-ability', style };
    }
};

export default {
    group: 'vars',
    resolve: 'resolveAbilities',
    mixin: WalkerAbilitiesMixin
};
