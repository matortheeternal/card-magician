import makeOptions from './src/options.js';
import DevoidFrame from './src/DevoidFrame.js';
import StandardFrame from './src/StandardFrame.js';
import ClearFrame from './src/ClearFrame.js';
import FNMPromoFrame from './src/FNMPromoFrame.js';
import proxyAutoOptions from './src/proxyAutoOptions.js';
import InvertedFrame from './src/InvertedFrame.js';

export default class FrameModule extends CardMagicianModule {
    static createOptions() {
        return makeOptions(this.frameOptions);
    }

    async init(card) {
        card.frames = [
            DevoidFrame,
            ClearFrame,
            InvertedFrame,
            FNMPromoFrame,
            StandardFrame
        ];

        card.hasFaceSymbol = () => Boolean(card.faceSymbol);
        card.isDFC = () => {
            if (card.id === 'back') return true;
            return card.id === 'front' && Object.hasOwn(card.parent(), 'back');
        };
        card.isFrontDFC = () => card.isDFC() && card.id === 'front';
        card.isBackDFC = () => card.id === 'back';
    }

    get cardClasses() {
        const classes = [`color-${this.card.getCardColorKey()}`];
        const meldStyle = this.card.meldStyle || 'none';
        if (meldStyle !== 'none') classes.push(`meld-${meldStyle}`);
        for (const bg of this.backgrounds)
            classes.push(`frame-${bg.id}`);
        return classes;
    }

    updateCardClasses(card) {
        if (!card.dom) return;
        card.dom.root.className = this.cardClasses.join(' ');
        card.dom.root.style = this.objectToStyle(this.varStyle || {});
    }

    async updateFrame(card) {
        if (!card.parent || card.rulesHTML === undefined) return;
        const wrapped = proxyAutoOptions(card, this.options);
        const Frame = card.frames.find(frame => frame.matches(wrapped));
        this.activeFrame = new Frame(wrapped, this);
        card.setAspectRatio(this.activeFrame.artDimensions);
        card.activeFrame = () => this.activeFrame;
        changed(card, 'activeFrame');
        this.backgrounds = await this.activeFrame.buildBackgrounds('frame', card);
        const vars = await this.activeFrame.buildBackgrounds('vars', card);
        this.varStyle = Object.assign({}, ...vars.map(v => v.style));
        this.updateCardClasses(card);
        this.requestRender();
    }

    bind(card, watch) {
        watch(card, [
            'colorIdentity', 'alias', 'superType', 'subType', 'rulesHTML', 'parent',
            'frame', 'artSize', 'hybridStyle', 'hybridBlendStyle', 'crownStyle',
            'nyxStyle', 'vehicleStyle', 'snowStyle', 'scrollsStyle', 'draftStyle',
            'miracleStyle', 'ubStyle', 'meldStyle', 'otherFrameOptions', 'borderColor',
            'resolvedFaceSymbol'
        ], () => this.updateFrame(card));
    }

    render() {
        if (!this.backgrounds) return;
        return this.backgrounds.map(bg => (
            `<div
                class="bg frame-${bg.id}"
                style="${this.objectToStyle(bg.style)}"
            ></div>`
        )).join('\n');
    }

    async styles() {
        return [await this.loadFile('style.css')];
    }

}
