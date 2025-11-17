export default class ColorIndicatorModule extends CardMagicianModule {
    async getIndicatorImage(card) {
        if (!card.colorIndicator) return '';
        const colors = card.colorIdentity.colors;
        if (colors.length === 1) {
            const key = card.getCardColorKey();
            return await this.assetURL(`indicator/${key}.png`);
        }
        if (colors.length === 2) {
            const [c1, c2] = colors;
            const img1 = await this.assetURL(`indicator/${c1.char}.png`);
            const img2 = await this.assetURL(`indicator/${c2.char}.png`);
            return await this.linearBlend(img1, img2, 0.5, 0.5, 0.499, 0.499);
        }
        return '';
    }

    async updateColorIdentity(card) {
        card.colorIdentity.setOverride(card.colorIndicator);
        this.colorIdentityImage = await this.getIndicatorImage(card);
        this.requestRender();
    }

    bind(card, watch) {
        watch(
            () => card.colorIndicator,
            () => this.updateColorIdentity(card)
        );
    }

    render(card) {
        return card.colorIndicator && (
            `<img src="${this.colorIdentityImage}">`
        );
    }

    get fields() {
        return [{
            id: 'colorIndicator',
            displayName: 'Color (Override)',
            group: 'manaCost'
        }]
    }
}
