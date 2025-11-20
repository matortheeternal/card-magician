/**
 * @abstract
 */
export default class Spout {
    constructor(thing) {
        this.card = thing.card;
        this.utils = thing.utils;
    }

    assetURL(path) {
        return this.utils.assetURL(path);
    }

    /**
     * @abstract
     * @returns {Promise<string>}
     */
    async apply() {
        throw new Error('Not implemented');
    }

    async finalize() {
        const url = await this.apply();
        const zIndex = this.provider.zIndex;
        return { url, zIndex };
    }
}
