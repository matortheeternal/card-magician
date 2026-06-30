import M20EmblemFrame from './src/M20EmblemFrame.js';
import TokenFrameModule from '../../M15/TokenFrame/main.js';

export default class M20EmblemFrameModule extends TokenFrameModule {
    async init(card) {
        await super.init(card, false);
        card.frames = [M20EmblemFrame];
    }

    get cardClasses() {
        const classes = [];
        for (const bg of this.backgrounds)
            classes.push(`frame-${bg.id}`);
        return classes;
    }
}
