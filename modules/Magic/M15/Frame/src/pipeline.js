//  ║      ║   o╗   ╚╣        ║     ╚══╝       ╚═══╬═══════════╗
//═╗║  ╔═══╣    ╚═══╗╚╗  Welcome to the background pipeline    ║
// ║║  ║   ╚══════╗ ║╔╝       ║     ╔══o           ║           ║
// ║╚══╩╦═══╗     ║ ╚╩════╗  o╩══════╗             ║    ╔══════╝
// ╠════╬═╗ ╚══╗ o╩o      ║         ╚╝            o╩══════o
// ╚╗   ║ ╚o   ║          ╚o❄️️
// 👑  ✨     🔲

import BaseProviders from './providers/index.js';
import BaseResolvers from './resolvers/index.js';
import BaseTransformers from './transformers/index.js';

export function buildProviders(Providers, card, module) {
    return Providers.filter(Provider => Provider.enabled(card))
        .map(Provider => new Provider(card, module));
}

export function buildResolvers(Resolvers, providers, card) {
    return providers.map(provider => {
        const Resolver = Resolvers.find(Resolver =>
            Resolver.matches(card, provider)
        );
        if (!Resolver) throw new Error(
            `Could not find resolver for ${provider.constructor.name}`
        );
        return new Resolver(provider);
    });
}

export function buildSpouts(Transformers, resolvers, card) {
    const spouts = [];
    resolvers.forEach(resolver => {
        const spout = Transformers.reduce((current, Transformer) => {
            if (Transformer.matches(card, current))
                return new Transformer(current, spouts);
            return current;
        }, resolver);
        spouts.push(spout);
    });
    return spouts;
}

export function runPipeline(
    card, module,
    Providers = BaseProviders,
    Resolvers = BaseResolvers,
    Transformers = BaseTransformers
) {
    const providers = buildProviders(Providers, card, module);
    const resolvers = buildResolvers(Resolvers, providers, card);
    const spouts =  buildSpouts(Transformers, resolvers, card);
    return Promise.all(spouts.map(spout => spout.finalize()));
}
