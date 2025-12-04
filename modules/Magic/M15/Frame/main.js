import makeFrameOptions from './src/frameOptions.js';
import makeTrimOptions from './src/trimOptions.js';
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
    card.isMiracle = () => card.trims.miracle;
    card.isFrameless = () => card.frame.frameless;
    card.isBorderless = () => card.frame.borderless;
    card.usesExpandedArt = () => card.isBorderless?.() || card.isFrameless?.();
    card.isClear = () => card.frame.clear;
    card.isDevoid = () => card.frame.devoid;
    card.isClearTop = () => false;
    card.isPuma = () => card.frame.puma;
    card.isMutate = () => card.frame.mutate;
    card.isBrawl = () => false;
    card.isCompanion = () => false;
}

export default class FrameModule extends CardMagicianModule {
    async init(card, createHelpers = true) {
        card.frames = [
            DevoidFrame,
            ClearFrame,
            NormalFrame
        ];
        this.frameOptions = this.makeReactive(makeFrameOptions());
        this.trimOptions = this.makeReactive(makeTrimOptions());

        card.hasFaceSymbol = () => Boolean(card.faceSymbol);
        card.isDFC = () => {
            if (card.id === 'back') return true;
            return card.id === 'front' && Object.hasOwn(card.parent(), 'back');
        };
        card.isFrontDFC = () => card.isDFC() && card.id === 'front';
        card.isBackDFC = () => card.isDFC() && card.id === 'back';
        if (createHelpers) createFrameHelpers(card);
    }

    async updateFrame(card) {
        if (!card.parent || card.rulesHTML === undefined) return;
        console.log('updateFrame called');
        const Frame = card.frames.find(frame => {
            return frame.matches(card);
        });
        const activeFrame = new Frame(card, this);
        card.setAspectRatio(activeFrame.artDimensions);
        card.activeFrame = () => activeFrame;
        this.backgrounds = await activeFrame.buildBackgrounds('frame', card);
        this.requestRender();
    }

    updateTopClasses(card) {
        const classes = [];
        for (const [key, value] of Object.entries(card.frame))
            if (value) classes.push(`frame-${key}`);
        card.dom.root.className = classes.join(' ');
    }

    bind(card, watch) {
        watch(() => [
            card.colorIdentity,
            card.superType,
            card.subType,
            card.rulesHTML,
            card.parent,
            card.frame,
            card.trims,
            card.hybridStyle,
            card.hybridBlendStyle
        ], () => this.updateFrame(card));
        watch(() => card.frame, () => this.updateTopClasses(card));
    }

    renderBackgrounds() {
        if (!this.backgrounds) return;
        return this.backgrounds.map(bg => (
            `<div class="bg frame-${bg.id}" style="${this.objectToStyle(bg.style)}"></div>`
        )).join('\n');
    }

    async styles() {
        return [await this.loadFile('style.css')];
    }

    get options() {
        return [{
            id: 'frame',
            label: 'Frame',
            type: 'checkboxlist',
            options: this.frameOptions
        }, {
            id: 'trims',
            type: 'checkboxlist',
            label: 'Trims',
            options: this.trimOptions
        }, {
            id: 'hybridStyle',
            type: 'multiselect',
            label: 'Hybrid Style',
            options: [
                { id: 'reverse', name: 'Reverse' },
                { id: 'vertical', name: 'Vertical' },
            ]
        }, {
            id: 'hybridBlendStyle',
            type: 'select',
            label: 'Hybrid Blend Style',
            options: [
                { id: 'grey', name: 'Grey' },
                { id: 'gold', name: 'Gold' },
                { id: 'hybrid', name: 'Hybrid' },
            ]
        }];
    }
}
