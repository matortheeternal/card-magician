const BindingMixin = {
    get bindingUrl() {
        return this.resolveAdventureAssetPath('binding');
    },

    async resolveBinding(card) {
        const image = this.coloredBlend(this.bindingUrl, card);
        return this.background('binding', image, 1);
    }
};

export default {
    group: 'pages',
    resolve: 'resolveBinding',
    mixin: BindingMixin
};
