function getBackgroundKey(card) {
    return [
        card.frameFolder,
        '_',
        card.colorIdentity.isHybrid() ? 'H' : 'X',
        ...card.colorIdentity.colors.map(c => c.char),
        ...card.colorIdentity.colors.map(c => c.char),
        '_',
        card.isSnow() ? 'S' : 'X',
        card.isLegendary() ? 'G' : 'X',
        card.isLand() ? 'L' : 'X',
        card.isArtifact() ? 'A' : 'X',
        card.isEnchantment() ? 'E' : 'X',
        card.isVehicle() ? 'V' : 'X',
    ].join('');
}

export default class FrameModule extends CardMagicianModule {
    async init() {
        const { buildPipeline } = await this.import('backgroundPipeline.js');
        this.backgroundPipeline = buildPipeline(this);
    }

    getFrameFolder(card) {
        const hasTwoFaces = Boolean(card.parent().back);
        if (hasTwoFaces && card.id === 'front' && card.isTransform && card.isTransform())
            return 'notched';
        if (card.isSnow && card.isSnow())
            return 'snow';
        if (hasTwoFaces)
            return card.id;
        return 'card';
    }

    async buildBackgrounds(card) {
        const backgrounds = {};
        card.backgroundsUsed = [];
        for (let pipe of this.backgroundPipeline) {
            if (!pipe.useBackground(card)) continue;
            card.backgroundsUsed.push(pipe.name);
            await pipe.apply(card, backgrounds);
        }
        return Object.values(backgrounds);
    }

    backgroundKeyChanged(card) {
        const newBackgroundKey = getBackgroundKey(card);
        const res = newBackgroundKey !== this.backgroundKey;
        console.log(newBackgroundKey, this.backgroundKey, res);
        this.backgroundKey = newBackgroundKey;
        return res;
    }

    async updateBackgrounds(card) {
        if (!card.parent) return;
        card.frameFolder = this.getFrameFolder(card);
        if (!this.backgroundKeyChanged(card)) return;
        this.backgrounds = await this.buildBackgrounds(card);
        this.requestRender();
    }

    bind(card, watch) {
        watch(() => [
            card.colorIdentity,
            card.superType,
            card.subType,
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
