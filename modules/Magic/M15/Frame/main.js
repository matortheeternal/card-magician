import { runPipeline } from './src/pipeline.js';
import { getFrameFolder } from './src/frameFolders.js';

export default class FrameModule extends CardMagicianModule {
    async init(card) {
        card.hybridStyle = 'grey';
        card.isMap = () => false;
        card.isDKA = () => false;
        card.isShifted = () => false;
        card.isInverted = () => false;
        card.isBeyond = () => false;
        card.isFNM = () => false;
        card.isEnergyLand = () => false;
        card.isMiracle = () => false;
        card.isFrameless = () => false;
        card.isBorderless = () => false;
        card.usesExpandedArt = () => card.isBorderless?.() || card.isFrameless?.();
        card.isClear = () => false;
        card.isDevoid = () => false;
        card.isClearTop = () => false;
        card.isPuma = () => false;
        card.isMutate = () => false;
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

    updateCardColors(card) {
        card.colors = card.colorIdentity.colors;
    }

    bind(card, watch) {
        watch(() => [
            card.colorIdentity,
            card.superType,
            card.subType,
            card.rulesHTML,
            card.parent
        ], () => this.updateBackgrounds(card));
        watch(() => card.colorIdentity, () => this.updateCardColors(card));
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
