import ClassicFrameModule from '../ClassicFrame/main.js';
import SagaFrame from './src/SagaFrame.js';

const SAGA_OPTIONS = ['hybridStyle', 'borderColor'];

export default class ClassicSagaFrameModule extends ClassicFrameModule {
    static createOptions() {
        return super.createOptions().filter(opt => SAGA_OPTIONS.includes(opt.id));
    }

    async init(card) {
        await super.init(card);
        card.frames = [SagaFrame];
    }
}
