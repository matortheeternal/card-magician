import Resolver from './Resolver.js';
import ColoredProvider from '../providers/ColoredProvider.js';

export default class ClearResolver extends Resolver {
    static matches(card, provider) {
        return card.isClear?.()
            && provider instanceof ColoredProvider;
    }

    async apply() {
        return await this.provider.resolve('x');
    }
}
