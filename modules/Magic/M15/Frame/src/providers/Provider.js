/**
 * @abstract
 */
export default class Provider {
    constructor(card, utils) {
        this.card = card;
        this.utils = utils;
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

    assetURL(path) {
        return this.utils.assetURL(path);
    }
}
