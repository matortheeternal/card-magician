export default class ColorIndicatorModule extends CardMagicianModule {
    async getIndicatorImage(card) {
        if (!card.colorIndicator?.length) return '';
        const colors = card.colorIdentity.colors;
        if (colors.length === 1) {
            const key = card.getCardColorKey();
            return this.resolveAsset(`indicator/${key}.png`);
        }
        if (colors.length === 2) {
            const [c1, c2] = colors;
            const img1 = this.resolveAsset(`indicator/${c1.char}.png`);
            const img2 = this.resolveAsset(`indicator/${c2.char}.png`);
            return await this.linearBlend(img1, img2, 0.5, 0.5, 0.499, 0.499).publish();
        }
        return '';
    }

    async updateColorIdentity(card) {
        const overrideColors = (card.colorIndicator || []);
        card.colorIdentity.setOverride(overrideColors.join(''));
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
        return card.colorIndicator?.length && (
            `<img src="${this.colorIdentityImage}">`
        );
    }

    get fields() {
        return [{
            id: 'colorIndicator',
            label: 'Color (Override)',
            type: 'multiselect',
            options: [
                { id: 'w', name: 'White' },
                { id: 'u', name: 'Blue' },
                { id: 'b', name: 'Black' },
                { id: 'r', name: 'Red' },
                { id: 'g', name: 'Green' },
            ]
        }];
    }
}
