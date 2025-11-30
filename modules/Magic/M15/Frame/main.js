import { runPipeline } from './src/pipeline.js';
import FrameFolderRegistry from './src/frameFolders.js';
import makeFrameOptions from './src/frameOptions.js';
import makeTrimOptions from './src/trimOptions.js';
import Transformers from './src/transformers/index.js';
import Providers from './src/providers/index.js';
import Resolvers from './src/resolvers/index.js';

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
        card.framePipeline ||= [
            Providers.slice(),
            Resolvers.slice(),
            Transformers.slice()
        ];
        this.folderRegistry = new FrameFolderRegistry();
        this.frameOptions = this.makeReactive(makeFrameOptions());
        this.trimOptions = this.makeReactive(makeTrimOptions());

        card.hasFaceSymbol = () => Boolean(card.faceSymbol);
        card.isDFC = () => {
            return card.id === 'front' || card.id === 'back'
                && Object.hasOwn(card.parent?.(), 'back');
        };
        card.isFrontDFC = () => card.isDFC() && card.id === 'front';
        card.isBackDFC = () => card.isDFC() && card.id === 'back';
        if (createHelpers) createFrameHelpers(card);
    }

    async updateBackgrounds(card) {
        if (!card.parent || card.rulesHTML === undefined) return;
        const folderRule = this.folderRegistry.resolveRule(card);
        card.frameFolder = folderRule.folder;
        card.frameExt = folderRule.ext;
        this.backgrounds = await runPipeline(card, this, ...card.framePipeline);
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
            `<div class="bg ${bg.className}" style="${bg.style}"></div>`
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
            type: 'select',
            label: 'Hybrid Style',
            options: [
                { id: 'grey', name: 'Grey' },
                { id: 'gold', name: 'Gold' },
                { id: 'hybrid', name: 'Hybrid' },
            ]
        }];
    }
}
