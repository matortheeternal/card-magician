function loyaltyCostUrl(type) {
    return new URL(`../../assets/loyalty/${type}.png`, import.meta.url).pathname;
}

const LoyaltyCostsMixin = {
    async resolveLoyaltyCosts() {
        const style = {
            '--walker-ability-plus-bg': `url("${loyaltyCostUrl('plus')}")`,
            '--walker-ability-minus-bg': `url("${loyaltyCostUrl('minus')}")`,
            '--walker-ability-zero-bg': `url("${loyaltyCostUrl('zero')}")`,
        };
        return { id: 'loyalty-costs', style };
    },
};

export default {
    group: 'vars',
    resolve: 'resolveLoyaltyCosts',
    mixin: LoyaltyCostsMixin
};
