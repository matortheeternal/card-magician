import Spout from '../Spout.js';

/**
 * @abstract
 */
export default class Resolver extends Spout {
    constructor(provider) {
        super(provider);
        this.provider = provider;
    }

    static matches(card, provider) {
        return false;
    }
}
