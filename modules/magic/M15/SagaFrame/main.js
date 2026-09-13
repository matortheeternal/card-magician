import FrameModule from '../Frame/main.js';
import SagaFrame from './src/SagaFrame.js';

const L = localize('module-M15-saga-frame');

export default class SagaFrameModule extends FrameModule {
    static createOptions() {
        const parentOptionIds = [
            'crownStyle', 'nyxStyle', 'snowStyle', 'vehicleStyle',
            'ubStyle', 'hybridStyle', 'hybridBlendStyle'
        ];
        return [
            {
                id: 'artSize',
                type: 'select',
                label: L`Art Size`,
                options: [
                    { id: 'normal',     name: L`Default` },
                    { id: 'reduced',    name: L`Reduced` },
                    { id: 'borderless', name: L`Borderless` },
                ]
            },
            ...super.createOptions().filter(
                opt => parentOptionIds.includes(opt.id)
            ),
        ];
    }

    async init(card) {
        await super.init(card);
        card.frames = [SagaFrame];
    }

}
