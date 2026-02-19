import FrameModule from '../Frame/main.js';
import TokenFrame from './src/TokenFrame.js';
import ClearTokenFrame from './src/ClearTokenFrame.js';

const L = localize('module-M15-token-frame');

export default class TokenFrameModule extends FrameModule {
    async init(card) {
        await super.init(card);
        card.isTall = () => card.otherFrameOptions?.tall;

        card.frames = [TokenFrame, ClearTokenFrame];
        this.frameOptions = [
            { id: 'normal',  name: L`Normal` },
            { id: 'clear',  name: L`Clear` },
        ];
    }

    get cardClasses() {
        return [
            `token-${this.activeFrame.frameHeight}`,
            ...(this.card.otherFrameOptions.hideSymbol
                ? ['hide-rarity']
                : []),
            ...super.cardClasses
        ];
    }

    get options() {
        const allowedOptions = [
            'frame', 'crownStyle', 'nyxStyle',
            'vehicleStyle', 'snowStyle',
            'hybridStyle', 'hybridBlendStyle'
        ];
        return super.options.filter(opt => {
            return allowedOptions.includes(opt.id);
        }).concat([{
            id: 'otherFrameOptions',
            type: 'checkboxlist',
            label: L`Extra options`,
            options: [
                { id: 'tall', label: L`Tall text box` },
                { id: 'hideSymbol', label: L`Hide Set Symbol` },
            ],
            default: { tall: false }
        }]);
    }
}
