const WalkerAbilityBackgroundsMixin = {
    async abilityBackground(path) {
        const source = this.resolveWalkerAssetPath(path);
        return this.ctx.makeTransparent(source, 0.62).publish();
    },

    async topAbilityBackground() {
        const bgUrl = await this.abilityBackground('stripe/top.png');
        return {
            background: `url('${bgUrl}')`,
            backgroundPosition: `46px 0`,
            backgroundSize: `300px 20px`,
            backgroundRepeat: `no-repeat`,
        };
    },

    async bottomAbilityBackground({ top, height }, first, last) {
        const bgUrl = await this.abilityBackground('stripe/bottom.png');
        const bgTopOffset = first ? 0 : 8;
        return {
            background: `url('${bgUrl}')`,
            backgroundPosition: `46px ${height + bgTopOffset}px`,
            backgroundSize: `300px 20px`,
            backgroundRepeat: `no-repeat`,
        };
    },

    // TODO: use constants to make this clearer
    async baseAbilityBackground({ top, height }, first, last) {
        const bgColor = 'rgba(255, 255, 255, 0.40)';
        const topOffset = first ? -5 : -15;
        const bgTopOffset = first ? '0' : '20px';
        const bgHeight = `${height - (first ? -6 : 6) - (last ? -10 : 6)}px`;
        const heightOffset = (first ? 9 : 20) + (last ? 10 : 0);
        return {
            background: `linear-gradient(${bgColor}, ${bgColor})`,
            backgroundPosition: `46px ${bgTopOffset}`,
            backgroundSize: `300px ${bgHeight}`,
            backgroundRepeat: `no-repeat`,
            top: `${top + topOffset}px`,
            height: `${height + heightOffset}px`,
            zIndex: -1,
        };
    },

    mergeStyle(obj) {
        for (const property in obj)
            obj[property] = obj[property].join(', ');
    },

    combineAbilityBackgrounds(index, backgrounds) {
        const id = `ability-${index + 1}`;
        const style = backgrounds.reduce((result, bg) => {
            Object.keys(bg).forEach(key => {
                if (!Object.hasOwn(result, key))
                    result[key] = [];
                result[key].push(bg[key]);
            });
            return result;
        }, {});
        this.mergeStyle(style);
        return { id, style };
    },

    async makeAbilityBackground(card, index, first, last) {
        const abilityRect = card.abilityRects[index];
        return this.combineAbilityBackgrounds(index, [
            !first && await this.topAbilityBackground(),
            await this.baseAbilityBackground(abilityRect, first, last),
            !last && await this.bottomAbilityBackground(abilityRect, first, last)
        ].filter(Boolean));

    },

    async resolveAbilityBackgrounds(card) {
        const bgs = [];
        for (let i = 0; i < card.abilityCount; i++) {
            if (i % 2 !== 0) continue;
            const first = i === 0;
            const last = i === card.abilityCount - 1;
            bgs.push(await this.makeAbilityBackground(card, i, first, last));
        }
        return bgs;
    },
};

export default {
    group: 'frame',
    resolve: 'resolveAbilityBackgrounds',
    mixin: WalkerAbilityBackgroundsMixin
};
