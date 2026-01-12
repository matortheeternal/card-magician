import M20TokenFrame from './src/M20TokenFrame.js';
import ClearM20TokenFrame from './src/ClearM20TokenFrame.js';
import TokenFrameModule from '../../M15/TokenFrame/main.js';

export default class M20TokenFrameModule extends TokenFrameModule {
    async init(card) {
        await super.init(card, false);
        card.frames = [ClearM20TokenFrame, M20TokenFrame];
    }

    updateTopClasses(card) {
        const classes = [`token-${this.activeFrame.frameHeight}`];
        if (card.getCardColorKey() === 'w')
            classes.push('inverted-name');
        if (card.otherFrameOptions.hideSymbol)
            classes.push(`hide-rarity`);
        for (const bg of this.backgrounds)
            classes.push(`frame-${bg.id}`);
        card.dom.root.className = classes.join(' ');
    }
}
