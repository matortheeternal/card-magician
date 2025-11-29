/**
 * @abstract
 */
export default class Spout {
    constructor(spoutOrProvider) {
        this.card = spoutOrProvider.card;
        this.ctx = spoutOrProvider.ctx;
    }

    resolveAsset(path) {
        return this.ctx.resolveAsset(path);
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
        const className = this.provider.constructor.name
            .replace('Provider', '')
            .separate('-')
            .toLowerCase();
        return { url, zIndex, className };
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
