import FrameModule from '../Frame/main.js';
import LandFrame from './src/LandFrame.js';

export default class LandFrameModule extends FrameModule {
    async init(card) {
        await super.init(card);
        card.frames = [LandFrame];
    }

    get options() {
        const parentOptionIds = ['crownStyle', 'snowStyle'];
        return [
            ...super.options.filter(
                opt => parentOptionIds.includes(opt.id)
            ),
        ];
    }
}
