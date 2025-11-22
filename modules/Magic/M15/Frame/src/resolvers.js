import Spout from './Spout.js';
import { ColoredProvider } from './providers.js';

/**
 * @abstract
 */
export class Resolver extends Spout {
    constructor(provider) {
        super(provider);
        this.provider = provider;
    }

    static matches(card, provider) {
        return false;
    }
}

export class ColorResolver extends Resolver {
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

export class HybridResolver extends Resolver {
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

export class BaseResolver extends Resolver {
    static matches(card, provider) {
        return true;
    }

    async apply() {
        return await this.provider.resolve();
    }
}

export default [
    HybridResolver,
    ColorResolver,
    BaseResolver
];
