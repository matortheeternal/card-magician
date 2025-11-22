import Resolver from './Resolver.js';
import ColoredProvider from '../providers/ColoredProvider.js';

export default class ColorResolver extends Resolver {
    static matches(card, provider) {
        return card.colorIdentity.colors.length !== 2
            && provider instanceof ColoredProvider;
    }

    async apply() {
        let key = this.card.getCardColorKey();
        if (this.provider.hasLandTemplates && this.card.isLand())
            key += 'l';
        return await this.provider.resolve(key);
    }
}
