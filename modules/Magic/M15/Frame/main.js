import makeOptions from './src/options.js';
import DevoidFrame from './src/DevoidFrame.js';
import NormalFrame from './src/NormalFrame.js';
import ClearFrame from './src/ClearFrame.js';

function createFrameHelpers(card) {
    card.isDKA = () => false;
    card.isShifted = () => card.frame.planeshifted;
    card.isInverted = () => card.frame.inverted;
    card.isBeyond = () => card.frame.ub;
    card.isFNM = () => card.frame.fnm;
    card.isEnergyLand = () => false;
    card.isFrameless = () => card.frame.frameless;
    card.isBorderless = () => card.frame.borderless;
    card.usesExpandedArt = () => card.isBorderless?.() || card.isFrameless?.();
    card.isClear = () => card.frame.clear;
    card.isDevoid = () => card.frame.devoid;
    card.isClearTop = () => false;
    card.isPuma = () => card.frame.puma;
    card.isBrawl = () => false;
}

export default class FrameModule extends CardMagicianModule {
    async init(card, createHelpers = true) {
        card.frames = [
            DevoidFrame,
            ClearFrame,
            NormalFrame
        ];

        card.hasFaceSymbol = () => Boolean(card.faceSymbol);
        card.isDFC = () => {
            if (card.id === 'back') return true;
            return card.id === 'front' && Object.hasOwn(card.parent(), 'back');
        };
        card.isFrontDFC = () => card.isDFC() && card.id === 'front';
        card.isBackDFC = () => card.id === 'back';
        if (createHelpers) createFrameHelpers(card);
    }

    updateTopClasses(card) {
        const classes = [];
        for (const bg of this.backgrounds)
            classes.push(`frame-${bg.id}`);
        card.dom.root.className = classes.join(' ');
    }

    async updateFrame(card) {
        if (!card.parent || card.rulesHTML === undefined) return;
        const Frame = card.frames.find(frame => {
            return frame.matches(card);
        });
        this.activeFrame = new Frame(card, this);
        card.setAspectRatio(this.activeFrame.artDimensions);
        card.activeFrame = () => this.activeFrame;
        this.backgrounds = await this.activeFrame.buildBackgrounds('frame', card);
        this.updateTopClasses(card);
        this.requestRender();
    }

    bind(card, watch) {
        watch(() => [
            card.colorIdentity, card.superType, card.subType, card.rulesHTML,
            card.parent, card.frame, card.hybridStyle, card.hybridBlendStyle,
            card.crownStyle, card.nyxStyle, card.vehicleStyle, card.snowStyle,
            card.scrollsStyle, card.draftStyle, card.miracleStyle, card.mutateStyle,
            card.ubStyle
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

    get options() {
        const options = makeOptions();
        const f = options.find(opt => opt.id === 'frame');
        f.options = this.makeReactive(this.frameOptions || f.options);
        return options;
    }
}
