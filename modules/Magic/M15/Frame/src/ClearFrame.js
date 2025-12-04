import NormalFrame from './NormalFrame.js';

function resolveAssetPath(path) {
    return new URL(`../assets/${path}`, import.meta.url).pathname;
}

export default class ClearFrame extends NormalFrame {
    static matches(card) {
        return card.frame.clear;
    }

    async coloredBlend(folder) {
        return `${folder}/x.png`;
    }

    get artDimensions() {
        return { width: 343, height: 471 };
    }

    /* --- FRAME --- */
    async maskFrame(imageUrl) {
        const maskUrl = resolveAssetPath('mask/frame/clear.png');
        return await this.ctx.maskImage(imageUrl, maskUrl);
    }

    /* --- CROWN --- */
    get crownMasks() {
        const masks = super.crownMasks;
        if (this.card.hasAlias?.())
            masks.push('mask/crown/expanded_alias.png');
        return masks;
    }

    /* --- MIRACLE --- */
    async resolveMiracleTrim(card) {
        if (!card.isMiracle?.()) return null;
        const imageUrl = `${this.miracleFolder}/x.png`;
        return this.background('miracle-trim', imageUrl);
    }
}
