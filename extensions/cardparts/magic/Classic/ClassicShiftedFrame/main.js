import FrameModule from '../../M15/Frame/main.js';
import ClassicShiftedFrame from './src/ClassicShiftedFrame.js';

const SUPPORTED_OPTIONS = ['hybridStyle', 'hybridBlendStyle', 'borderColor'];

export default class ClassicShiftedFrameModule extends FrameModule {
    static createOptions() {
        return super.createOptions()
            .filter(opt => SUPPORTED_OPTIONS.includes(opt.id));
    }

    async init(card) {
        await super.init(card);
        card.frames = [ClassicShiftedFrame];
    }
}
