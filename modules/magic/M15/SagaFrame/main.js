import FrameModule from '../Frame/main.js';
import SagaFrame from './src/SagaFrame.js';

const L = localize('module-M15-saga-frame');

export default class SagaFrameModule extends FrameModule {
    async init(card) {
        await super.init(card);
        card.frames = [SagaFrame];
    }

    get options() {
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
            ...super.options.filter(
                opt => parentOptionIds.includes(opt.id)
            ),
        ];
    }
}
