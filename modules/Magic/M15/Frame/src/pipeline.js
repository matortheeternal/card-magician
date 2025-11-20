import Providers from './providers.js';
import Resolvers from './resolvers.js';
import Transformers from './transformers.js';

export function buildProviders(card, module) {
    return Object.values(Providers)
        .filter(Provider => Provider.enabled(card))
        .map(Provider => new Provider(card, module));
}

export function buildResolvers(providers, card) {
    return providers.map(provider => {
        const Resolver = Object.values(Resolvers).find(Resolver =>
            Resolver.matches(card, provider)
        );
        if (!Resolver) throw new Error(
            `Could not find resolver for ${provider.constructor.name}`
        );
        return new Resolver(provider);
    });
}

export function buildSpouts(resolvers, card) {
    return resolvers.map(resolver => {
        return Object.values(Transformers).reduce((current, Transformer) => {
            if (Transformer.matches(card, current))
                return new Transformer(current);
            return current;
        }, resolver);
    });
}

export function runPipeline(card, module) {
    const providers = buildProviders(card, module);
    const resolvers = buildResolvers(providers, card);
    const spouts =  buildSpouts(resolvers, card);
    return Promise.all(spouts.map(spout => spout.finalize()));
}
