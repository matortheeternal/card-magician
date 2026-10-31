import FrameModule from '../Frame/main.js';
import SagaCreatureFrame from './src/SagaCreatureFrame.js';

export default class SagaCreatureFrameModule extends FrameModule {
    static createOptions() {
        return super.createOptions().filter(opt => opt.id === 'ubStyle');
    }

    async init(card) {
        await super.init(card);
        card.frames = [SagaCreatureFrame];
    }
}
