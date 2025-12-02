import FrameModule from '../Frame/main.js';
import AdventureFrame from './src/AdventureFrame.js';
import AdventureSpotlightFrame from './src/AdventureSpotlightFrame.js';

export default class AdventureFrameModule extends FrameModule {
    async init(card) {
        await super.init(card, false);
        this.frameOptions = this.makeReactive([
            { id: 'spotlight', label: 'Spotlight Adventure' },
            { id: 'reversed', label: 'Reversed Adventure' },
            { id: 'ub', label: 'Universes Beyond' },
        ]);
        card.frames = [
            AdventureSpotlightFrame,
            AdventureFrame
        ];
    }
}
