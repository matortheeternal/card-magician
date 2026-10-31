import M20TokenFrame from './src/M20TokenFrame.js';
import ClearM20TokenFrame from './src/ClearM20TokenFrame.js';
import TokenFrameModule from '../../M15/TokenFrame/main.js';

export default class M20TokenFrameModule extends TokenFrameModule {
    async init(card) {
        await super.init(card, false);
        card.frames = [ClearM20TokenFrame, M20TokenFrame];
    }

    get cardClasses() {
        return [
            `token-${this.activeFrame.frameHeight}`,
            ...(this.card.getCardColorKey() === 'w'
                ? ['inverted-name']
                : []),
            ...(this.card.otherFrameOptions.hideSymbol
                ? ['hide-rarity']
                : []),
            ...super.cardClasses
        ];
    }
}
