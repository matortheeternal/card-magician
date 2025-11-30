import { runPipeline } from '../Frame/src/pipeline.js';
import MapFrameProvider from './src/MapFrameProvider.js';
import ColorResolver from '../Frame/src/resolvers/ColorResolver.js';
import HybridResolver from '../Frame/src/resolvers/HybridResolver.js';
import FrameModule from '../Frame/main.js';

const Providers = [MapFrameProvider];
const Resolvers = [HybridResolver, ColorResolver];
const Transformers = [];
const pipeline = [Providers, Resolvers, Transformers];

export default class MapFrameModule extends FrameModule {
    async updateBackgrounds(card) {
        this.backgrounds = await runPipeline(card, this, ...pipeline);
        this.requestRender();
    }

    async init(card) {}

    bind(card, watch) {
        watch(() => card.colorIdentity, () => this.updateBackgrounds(card));
    }

    get options() { return [] }
}
