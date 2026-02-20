const LevelsMixin = {
    get levelsSubfolder() {
        return this.card.isBackDFC?.() ? 'back' : 'standard';
    },

    get levelsFolder() {
        return this.resolveAssetPath(`element/levelbox`);
    },

    getLevelKey(card) {
        if (card.colorIdentity.isHybrid()) return 'c';
        return card.getCardColorKey();
    },

    get transparentLevels() {
        if (!this.card.isStation?.() || !this.card.artSize === 'borderless')
            return null;
        return [1, 0.15, 0.5, 0.85];
    },

    async resolveLevel(card, level) {
        const basePath = `${this.levelsFolder}/${level}/${this.getLevelKey(card)}.png`;
        if (!this.transparentLevels) return basePath;
        const opacityValue = this.transparentLevels[level];
        return this.ctx.makeTransparent(basePath, opacityValue).publish();
    },

    async resolveLevels(card) {
        if (!card.hasLevels?.() && !card.isStation?.()) return;
        const style = {
            '--level-0-bg': `url("${await this.resolveLevel(card, 0)}")`,
            '--level-1-bg': `url("${await this.resolveLevel(card, 1)}")`,
            '--level-2-bg': `url("${await this.resolveLevel(card, 2)}")`,
            '--level-3-bg': `url("${await this.resolveLevel(card, 3)}")`,
        };
        return { id: 'levels', style };
    },
};

export default {
    group: 'vars',
    resolve: 'resolveLevels',
    mixin: LevelsMixin
};
