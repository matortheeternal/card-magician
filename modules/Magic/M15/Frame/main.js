import { runPipeline } from './src/pipeline.js';
import { getFrameFolder } from './src/frameFolders.js';
import makeFrameOptions from './src/frameOptions.js'
import makeTrimOptions from './src/trimOptions.js'

export default class FrameModule extends CardMagicianModule {
    async init(card) {
        this.frameOptions = this.makeReactive(makeFrameOptions());
        this.trimOptions = this.makeReactive(makeTrimOptions());
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
        card.hasFaceSymbol = () => false;
        card.isDFC = () => Object.hasOwn(card.parent?.() || {}, 'back');
        card.isFrontDFC = () => card.isDFC() && card.id === 'front';
        card.isBackDFC = () => card.isDFC() && card.id === 'back';
    }

    async updateBackgrounds(card) {
        if (!card.parent || card.rulesHTML === undefined) return;
        card.frameFolder = getFrameFolder(card);
        this.backgrounds = await runPipeline(card, this);
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
            card.trims
        ], () => this.updateBackgrounds(card));
        watch(() => card.frame, () => this.updateTopClasses(card))
    }

    renderBackgrounds() {
        if (!this.backgrounds) return;
        this.backgrounds.forEach(bg => {
            bg.style = `background-image: url('${bg.url}'); z-index: ${bg.zIndex};`;
        });
        return this.backgrounds.map(bg => (
            `<div class="bg" style="${bg.style}"></div>`
        )).join('\n');
    }

    async styles() {
        return [await this.loadFile('style.css')];
    }

    get options() {
        return [{
            id: 'frame',
            displayName: 'Frame',
            type: 'checkboxlist',
            options: this.frameOptions
        }, {
            id: 'trims',
            type: 'checkboxlist',
            displayName: 'Trims',
            options: this.trimOptions
        }, {
            id: 'hybridStyle',
            type: 'select',
            displayName: 'Hybrid Style',
            default: 'grey',
            options: [
                { id: 'grey', name: 'Grey' },
                { id: 'gold', name: 'Gold' },
                { id: 'hybrid', name: 'Hybrid' },
            ]
        }];
    }
}
