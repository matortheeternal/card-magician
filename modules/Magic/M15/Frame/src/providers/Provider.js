/**
 * @abstract
 */
export default class Provider {
    constructor(card, ctx) {
        this.card = card;
        this.ctx = ctx;
        if (this.zIndex === undefined) this.zIndex = 0;
    }

    /**
     * @abstract
     * @param card
     * @returns {boolean}
     */
    static enabled(card) {
        return true;
    }

    get isTrim() {
        return false;
    }

    resolveAsset(path) {
        return this.ctx.resolveAsset(path);
    }
}
