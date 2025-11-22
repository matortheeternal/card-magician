import { runPipeline } from './src/pipeline.js';
import { getFrameFolder } from './src/frameFolders.js';

function getBackgroundKey(card) {
    return [
        card.frameFolder,
        '_',
        card.colorIdentity.isHybrid() ? 'H' : '',
        ...card.colorIdentity.colors.map(c => c.char),
        '_',
        card.isSnow() ? 'S' : '',
        card.isLegendary() ? 'G' : '',
        card.isLand() ? 'L' : '',
        card.isArtifact() ? 'A' : '',
        card.isEnchantment() ? 'E' : '',
        card.isVehicle() ? 'V' : '',
    ].join('');
}

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
        card.isDFC = () => Object.hasOwn(card.parent(), 'back');
        card.isFrontDFC = () => card.isDFC() && card.id === 'front';
        card.isBackDFC = () => card.isDFC() && card.id === 'back';
    }

    backgroundKeyChanged(card) {
        const newBackgroundKey = getBackgroundKey(card);
        const res = newBackgroundKey !== this.backgroundKey;
        if (res) console.debug('%cBackgrounds changed: %s, %s', 'color:dodgerblue',
            this.backgroundKey, newBackgroundKey);
        this.backgroundKey = newBackgroundKey;
        return res;
    }

    async updateBackgrounds(card) {
        if (!card.parent || card.rulesHTML === undefined) return;
        card.frameFolder = getFrameFolder(card);
        if (!this.backgroundKeyChanged(card)) return;
        this.backgrounds = await runPipeline(card, this);
        this.requestRender();
    }

    bind(card, watch) {
        watch(() => [
            card.colorIdentity,
            card.superType,
            card.subType,
            card.rulesHTML,
            card.parent
        ], () => this.updateBackgrounds(card))
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
}
