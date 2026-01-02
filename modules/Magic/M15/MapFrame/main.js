import FrameModule from '../Frame/main.js';
import MapFrame from './src/MapFrame.js';

export default class MapFrameModule extends FrameModule {
    async init(card) {
        card.frames = [MapFrame];
    }

    bind(card, watch) {
        watch(card, ['colorIdentity', 'superType'], () => this.updateFrame(card));
    }

    get options() { return []; }
}
