import FrameModule from '../Frame/main.js';
import SagaCreatureFrame from './src/SagaCreatureFrame.js';

export default class SagaCreatureFrameModule extends FrameModule {
    async init(card) {
        await super.init(card);
        card.frames = [SagaCreatureFrame];
    }

    get options() {
        const parentOptionIds = [
            'crownStyle', 'ubStyle'
        ];
        return [
            ...super.options.filter(
                opt => parentOptionIds.includes(opt.id)
            ),
        ];
    }

    async style() {
        return [await this.loadFile('style.css')];
    }
}
