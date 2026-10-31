import M20SpecialEmblemFrame from './src/M20SpecialEmblemFrame.js';
import FrameModule from '../../M15/Frame/main.js';

export default class M20SpecialEmblemFrameModule extends FrameModule {
    async init(card) {
        await super.init(card, false);
        card.frames = [M20SpecialEmblemFrame];
    }

    get cardClasses() {
        return [`frame-mechanic`];
    }

    get options() {
        const allowedOptions = ['frame'];
        return super.options.filter(opt => {
            return allowedOptions.includes(opt.id);
        });
    }
}
