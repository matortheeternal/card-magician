import FrameModule from '../../M15/Frame/main.js';
import ClassicFrame from './src/ClassicFrame.js';
import ClearFrame from './src/ClearFrame.js';
import ShiftedFrame from './src/ShiftedFrame.js';
import classicOptions from './src/options.js';

const INHERITED_OPTIONS = ['hybridStyle', 'hybridBlendStyle', 'borderColor'];

export default class ClassicFrameModule extends FrameModule {
    static createOptions() {
        const inherited = super.createOptions()
            .filter(opt => INHERITED_OPTIONS.includes(opt.id));
        return [...classicOptions, ...inherited];
    }

    async init(card) {
        await super.init(card);
        card.frames = [ClassicFrame, ShiftedFrame, ClearFrame];
    }

    bind(card, watch) {
        super.bind(card, watch);
        watch(card, [
            'dualLandBlend', 'nonbasicLandColoring', 'multicolorGradient',
            'artifactGradient', 'colorlessStyle', 'frameOpacity'
        ], () => this.updateFrame(card));
    }
}
