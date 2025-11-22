import Spout from '../Spout.js';

/**
 * @abstract
 */
export default class Transformer extends Spout {
    /**
     * @abstract
     * @param card
     * @param resolver
     * @returns {boolean}
     */
    static matches(card, resolver) {
        return false;
    }

    constructor(spout, spouts) {
        super(spout);
        this.allSpouts = spouts;
        this.target = spout;
        this.provider = spout.provider;
    }
}
