import Resolver from './Resolver.js';

export default class BaseResolver extends Resolver {
    static matches(card, provider) {
        return true;
    }

    async apply() {
        return await this.provider.resolve();
    }
}
