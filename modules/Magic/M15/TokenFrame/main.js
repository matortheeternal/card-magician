import FrameModule from '../Frame/main.js';
import TokenFrame from './src/TokenFrame.js';
import ClearTokenFrame from './src/ClearTokenFrame.js';

const L = localize('module-M15-token-frame');

export default class TokenFrameModule extends FrameModule {
    async init(card) {
        await super.init(card, false);
        card.isTall = () => card.otherFrameOptions?.tall;
        card.isClear = () => card.frame?.clear;

        card.frames = [TokenFrame, ClearTokenFrame];
        this.frameOptions = [
            { id: 'normal',  name: L`Normal` },
            { id: 'clear',  name: L`Clear` },
        ];
    }

    updateTopClasses(card) {
        const classes = [`token-${this.activeFrame.frameHeight}`];
        if (card.otherFrameOptions.hideSymbol)
            classes.push(`hide-rarity`);
        for (const bg of this.backgrounds)
            classes.push(`frame-${bg.id}`);
        card.dom.root.className = classes.join(' ');
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
