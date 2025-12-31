const L = localize('module-M15-color-indicator');

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
        changed(card, 'colorIdentity');
        this.colorIdentityImage = await this.getIndicatorImage(card);
        this.requestRender();
    }

    bind(card, watch) {
        watch(card, 'colorIndicator', () => this.updateColorIdentity(card));
    }

    render(card) {
        return card.colorIndicator?.length && (
            `<img src="${this.colorIdentityImage}">`
        );
    }

    get fields() {
        return [{
            id: 'colorIndicator',
            label: L`Color (Override)`,
            type: 'multiselect',
            options: [
                { id: 'w', name: L`White` },
                { id: 'u', name: L`Blue` },
                { id: 'b', name: L`Black` },
                { id: 'r', name: L`Red` },
                { id: 'g', name: L`Green` },
            ]
        }];
    }
}
