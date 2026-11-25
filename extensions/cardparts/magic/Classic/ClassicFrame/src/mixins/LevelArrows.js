const LevelArrowsMixin = {
    get levelArrowUrl() {
        return this.resolveAssetPath('element/level/arrow.png');
    },

    async resolveLevelArrows(card) {
        if (!card.hasLevels?.()) return;
        const arrow = `url("${this.levelArrowUrl}")`;
        const style = {
            '--level-1-arrow': arrow,
            '--level-2-arrow': arrow,
            '--level-3-arrow': arrow,
        };
        return { id: 'level-arrows', style };
    },
};

export default {
    group: 'vars',
    resolve: 'resolveLevelArrows',
    mixin: LevelArrowsMixin
};
