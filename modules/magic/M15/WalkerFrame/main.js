import FrameModule from '../Frame/main.js';
import WalkerFrame from './src/WalkerFrame.js';

const L = localize('module-M15-walker-frame');

export default class WalkerFrameModule extends FrameModule {
    async init(card) {
        await super.init(card);
        card.frames = [WalkerFrame];
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
