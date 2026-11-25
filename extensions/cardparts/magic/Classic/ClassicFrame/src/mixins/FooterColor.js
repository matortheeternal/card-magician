const LIGHT_TEXT_KEYS = ['b', 'l'];

const FooterColorMixin = {
    get footerColorKey() {
        if (this.isLand) return 'l';
        if (this.card.colorIdentity.isHybrid())
            return this.card.colorIdentity.colors[0].char;
        return this.card.getCardColorKey();
    },

    get footerColor() {
        return LIGHT_TEXT_KEYS.includes(this.footerColorKey) ? 'white' : 'black';
    },

    async resolveFooterColor() {
        const style = { '--footer-color': this.footerColor };
        return { id: 'footer-color', style };
    },
};

export default {
    group: 'vars',
    resolve: 'resolveFooterColor',
    mixin: FooterColorMixin
};
