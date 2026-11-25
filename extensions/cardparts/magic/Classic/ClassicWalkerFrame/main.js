import ClassicFrameModule from '../ClassicFrame/main.js';
import WalkerFrame from './src/WalkerFrame.js';

const EXCLUDED_OPTIONS = ['frame', 'artSize', 'frameOpacity'];

export default class ClassicWalkerFrameModule extends ClassicFrameModule {
    static createOptions() {
        return super.createOptions()
            .filter(opt => !EXCLUDED_OPTIONS.includes(opt.id));
    }

    async init(card) {
        await super.init(card);
        card.frames = [WalkerFrame];
    }
}
