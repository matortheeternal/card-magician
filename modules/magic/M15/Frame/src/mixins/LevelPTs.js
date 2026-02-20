const LevelPTsMixin = {
    getPtMult(level) {
        return this.resolveAssetPath(`mask/ptmult/${level}.png`);
    },

    async getLevelPt(card, level) {
        if (!this.getPtPath) throw new Error('PT module is required for LevelPTs');
        return this.ctx.combineBlend(
            this.getPtPath(card),
            this.getPtMult(level),
            'multiply'
        ).publish();
    },

    async resolveLevelPts(card) {
        if (!card.hasLevels?.()) return;
        const style = {
            '--level-1-pt': `url("${await this.getLevelPt(card, 1)}")`,
            '--level-2-pt': `url("${await this.getLevelPt(card, 2)}")`,
            '--level-3-pt': `url("${await this.getLevelPt(card, 3)}")`,
        };
        return { id: 'levels', style };
    },
};

export default {
    group: 'vars',
    resolve: 'resolveLevelPts',
    mixin: LevelPTsMixin
};
