/**
 * @abstract
 */
export default class Spout {
    constructor(spoutOrProvider) {
        this.card = spoutOrProvider.card;
        this.utils = spoutOrProvider.utils;
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

    hasSpout(callback) {
        let cursor = this;
        while (cursor instanceof Spout) {
            if (callback(cursor)) return true;
            cursor = cursor.target;
        }
        return false;
    }
}
