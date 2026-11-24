import FrameModule from '../../M15/Frame/main.js';
import ClassicShiftedFrame from './src/ClassicShiftedFrame.js';
import classicOptions from './src/options.js';

const INHERITED_OPTIONS = ['hybridStyle', 'hybridBlendStyle', 'borderColor'];

export default class ClassicShiftedFrameModule extends FrameModule {
    static createOptions() {
        const inherited = super.createOptions()
            .filter(opt => INHERITED_OPTIONS.includes(opt.id));
        return [...classicOptions, ...inherited];
    }

    async init(card) {
        await super.init(card);
        card.frames = [ClassicShiftedFrame];
    }

    bind(card, watch) {
        super.bind(card, watch);
        watch(card, 'dualLandBlend', () => this.updateFrame(card));
    }
}
