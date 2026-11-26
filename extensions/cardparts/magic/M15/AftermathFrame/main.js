import SplitFrameModule from '../SplitFrame/main.js';
import AftermathFrame from './src/AftermathFrame.js';

export default class AftermathFrameModule extends SplitFrameModule {
    async init(card) {
        card.frames = [AftermathFrame];
    }

    applyArtDimensions(card) {
        const { top, bottom } = card.activeFrame.artDimensions;
        card.top.setAspectRatio(top);
        card.bottom.setAspectRatio(bottom);
    }
}
