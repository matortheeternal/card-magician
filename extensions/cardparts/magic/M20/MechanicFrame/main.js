import M20MechanicFrame from './src/M20MechanicFrame.js';
import FrameModule from '../../M15/Frame/main.js';

export default class M20MechanicFrameModule extends FrameModule {
    async init(card) {
        await super.init(card, false);
        card.frames = [M20MechanicFrame];
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
