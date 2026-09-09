import FrameModule from '../Frame/main.js';
import LandFrame from './src/LandFrame.js';
import SnowLandFrame from './src/SnowLandFrame.js';

const L = localize('module-M15-land-frame');

export default class LandFrameModule extends FrameModule {
    async init(card) {
        await super.init(card);
        this.frameOptions = [
            { id: 'basic',  name: L`Basic` },
            { id: 'snow',   name: L`Snow` },
        ];
        card.frames = [LandFrame, SnowLandFrame];
    }

    get options() {
        return [
            ...super.options.filter(
                opt => opt.id === 'frame'
            ),
        ];
    }
}
