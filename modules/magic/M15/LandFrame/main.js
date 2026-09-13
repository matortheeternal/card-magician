import FrameModule from '../Frame/main.js';
import LandFrame from './src/LandFrame.js';
import SnowLandFrame from './src/SnowLandFrame.js';

const L = localize('module-M15-land-frame');

export default class LandFrameModule extends FrameModule {
    static frameOptions = [
        { id: 'basic',  name: L`Basic` },
        { id: 'snow',   name: L`Snow` },
    ];

    static createOptions() {
        return super.createOptions().filter(opt => opt.id === 'frame');
    }

    async init(card) {
        await super.init(card);
        card.frames = [LandFrame, SnowLandFrame];
    }
}
