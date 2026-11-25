import FrameModule from '../Frame/main.js';
import WalkerFrame from './src/WalkerFrame.js';

const L = localize('module-M15-walker-frame');

export default class WalkerFrameModule extends FrameModule {
    static createOptions() {
        return [{
            id: 'artSize',
            type: 'select',
            label: L`Art Size`,
            options: [
                { id: 'normal',     name: L`Default` },
                { id: 'borderless', name: L`Borderless` },
            ]
        }, {
            id: 'otherFrameOptions',
            type: 'checkboxlist',
            label: L`Extra options`,
            options: [
                { id: 'tall', label: L`Tall text box` },
            ],
            default: { tall: false }
        }];
    }

    async init(card) {
        await super.init(card);
        card.isTall = () => card.otherFrameOptions?.tall;
        card.frames = [WalkerFrame];
    }

    get cardClasses() {
        return [
            `walker-${this.activeFrame.frameHeight}`,
            ...super.cardClasses
        ];
    }

    bind(card, watch) {
        watch(card, [
            'colorIdentity', 'superType', 'subType', 'rulesHTML', 'parent', 'frame',
            'artSize', 'meldStyle', 'otherFrameOptions', 'faceSymbol', 'abilityRects'
        ], () => this.updateFrame(card));
    }
}
