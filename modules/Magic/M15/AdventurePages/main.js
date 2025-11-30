import { runPipeline } from '../Frame/src/pipeline.js';
import LeftPageProvider from './src/LeftPageProvider.js';
import RightPageProvider from './src/RightPageProvider.js';
import BindingProvider from './src/BindingProvider.js';
import ParentColorResolver from './src/ParentColorResolver.js';
import ColorResolver from '../Frame/src/resolvers/ColorResolver.js';
import FrameModule from '../Frame/main.js';

export default class AdventurePagesModule extends FrameModule {
    async updateBackgrounds(card) {
        this.backgrounds = await runPipeline(card, this, ...this.pipeline);
        this.requestRender();
    }

    async init(card) {
        const Providers = [LeftPageProvider, RightPageProvider, BindingProvider];
        const Resolvers = [ParentColorResolver, ColorResolver];
        const Transformers = [];
        this.pipeline = [Providers, Resolvers, Transformers];
    }

    bind(card, watch) {
        watch(() => [card.colorIdentity, card.parent()?.colorIdentity],
              () => this.updateBackgrounds(card));
    }

    get options() {
        return [{
            id: 'pageStyle',
            displayName: 'Page Style',
            type: 'select',
            options: [
                { id: 'blank', label: 'Blank' },
                { id: 'name', label: 'Name' },
                { id: 'name_flat', label: 'Flat Name' },
                { id: 'name_and_type', label: 'Name and Type' },
                { id: 'name_and_type_flat', label: 'Flat Name and Type' },
            ]
        }]
    }
}
