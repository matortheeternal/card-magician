const LevelsMixin = {
    get levelsSubfolder() {
        return this.card.isBackDFC?.() ? 'back' : 'normal';
    },

    get levelsFolder() {
        return this.resolveAssetPath(`element/levelbox`);
    },

    getLevelKey(card) {
        if (card.colorIdentity.isHybrid()) return 'c';
        return card.getCardColorKey();
    },

    getLevelPath(card, level) {
        // TODO: use blends
        return `${this.levelsFolder}/${level}/${this.getLevelKey(card)}.png`;
    },

    async resolveLevels(card) {
        if (!card.hasLevels?.()) return;
        const style = {
            '--level-1-bg': `url("${this.getLevelPath(card, 1)}")`,
            '--level-2-bg': `url("${this.getLevelPath(card, 2)}")`,
            '--level-3-bg': `url("${this.getLevelPath(card, 3)}")`,
        };
        return { id: 'levels', style };
    },
};

export default {
    group: 'vars',
    resolve: 'resolveLevels',
    mixin: LevelsMixin
};
