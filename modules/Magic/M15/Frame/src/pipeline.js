//  ║      ║   o╗   ╚╣        ║     ╚══╝       ╚═══╬═══════════╗
//═╗║  ╔═══╣    ╚═══╗╚╗  Welcome to the background pipeline    ║
// ║║  ║   ╚══════╗ ║╔╝       ║     ╔══o           ║           ║
// ║╚══╩╦═══╗     ║ ╚╩════╗  o╩══════╗             ║    ╔══════╝
// ╠════╬═╗ ╚══╗ o╩o      ║         ╚╝            o╩══════o
// ╚╗   ║ ╚o   ║          ╚o❄️️
// 👑  ✨     🔲

import Providers from './providers/index.js';
import Resolvers from './resolvers/index.js';
import Transformers from './transformers/index.js';

export function buildProviders(card, module) {
    return Providers.filter(Provider => Provider.enabled(card))
        .map(Provider => new Provider(card, module));
}

export function buildResolvers(providers, card) {
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

export function buildSpouts(resolvers, card) {
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

export function runPipeline(card, module) {
    const providers = buildProviders(card, module);
    const resolvers = buildResolvers(providers, card);
    const spouts =  buildSpouts(resolvers, card);
    return Promise.all(spouts.map(spout => spout.finalize()));
}
