import FrameModule from '../Frame/main.js';
import SplitFrame from './src/SplitFrame.js';

export default class SplitFrameModule extends FrameModule {
    static createOptions() { return []; }

    async init(card) {
        card.canRotate = true;
        card.frames = [SplitFrame];
    }

    async updateTopFrame(card) {
        if (!card.activeFrame || !card.top) return;
        this.topBackgrounds = await card.activeFrame.buildBackgrounds('top', card);
        this.requestRender({ render: 'renderTop' });
    }

    async updateBottomFrame(card) {
        if (!card.activeFrame || !card.bottom) return;
        this.bottomBackgrounds = await card.activeFrame.buildBackgrounds('bottom', card);
        this.requestRender({ render: 'renderBottom' });
    }

    async updateFrame(card) {
        const Frame = card.frames.find(frame => {
            return frame.matches(card);
        });
        card.activeFrame = new Frame(card, this);
        card.setAspectRatio(card.activeFrame.artDimensions);
        changed(card, 'activeFrame');
        this.backgrounds = await card.activeFrame.buildBackgrounds('frame', card);
        this.requestRender({ render: 'render' });
    }

    bind(card, watch) {
        super.bind(card, watch);
        watch(card, 'activeFrame', async () => {
            await this.updateTopFrame(card);
            await this.updateBottomFrame(card);
        });
        watch(card.top, ['colorIdentity', 'parent'],
              () => this.updateTopFrame(card));
        watch(card.bottom, ['colorIdentity', 'parent'],
              () => this.updateBottomFrame(card));
    }

    renderTop() {
        if (!this.topBackgrounds) return;
        return this.topBackgrounds.map(bg => (
            `<div class="bg ${bg.id}" style="${this.objectToStyle(bg.style)}"></div>`
        )).join('\n');
    }

    renderBottom() {
        if (!this.bottomBackgrounds) return;
        return this.bottomBackgrounds.map(bg => (
            `<div class="bg ${bg.id}" style="${this.objectToStyle(bg.style)}"></div>`
        )).join('\n');
    }
}
