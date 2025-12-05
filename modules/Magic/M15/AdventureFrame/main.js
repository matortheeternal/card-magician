import FrameModule from '../Frame/main.js';
import AdventureFrame from './src/AdventureFrame.js';
import AdventureSpotlightFrame from './src/AdventureSpotlightFrame.js';

export default class AdventureFrameModule extends FrameModule {
    async init(card) {
        await super.init(card, false);
        this.frameOptions = [
            { id: 'normal',     name: 'Adventure' },
            { id: 'spotlight',  name: 'Spotlight Adventure' },
            { id: 'reversed',   name: 'Reversed Adventure' },
        ];
        card.frames = [
            AdventureSpotlightFrame,
            AdventureFrame
        ];
    }
}
