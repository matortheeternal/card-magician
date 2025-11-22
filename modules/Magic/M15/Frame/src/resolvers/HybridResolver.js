import ColoredProvider from '../providers/ColoredProvider.js';
import Resolver from './Resolver.js';

export default class HybridResolver extends Resolver {
    static matches(card, provider) {
        return card.colorIdentity.colors.length === 2
            && provider instanceof ColoredProvider;
    }

    async apply() {
        let [c1, c2] = this.card.colorIdentity.colors.map(c => c.char);
        if (this.provider.hasLandTemplates && this.card.isLand()) {
            c1 += 'l';
            c2 += 'l';
        }
        const images = await Promise.all([
            this.provider.resolve(c2),
            this.provider.resolve(c1)
        ]);
        return await this.utils.linearBlend(...images, 0.4, 0, 0.6, 0);
    }
}
