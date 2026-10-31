export default class ColorIndicatorModule extends CardMagicianModule {
    async getIndicatorImage(card) {
        if (!card.colorOverride?.length) return '';
        const colors = card.colorIdentity.colors.filter(c => c.sources.override);
        if (colors.length === 1) {
            const key = card.getCardColorKey();
            return this.resolveAsset(`indicator/${key}.png`);
        }
        if (colors.length === 2) {
            const [c1, c2] = colors;
            const img1 = this.resolveAsset(`indicator/${c1.char}.png`);
            const img2 = this.resolveAsset(`indicator/${c2.char}.png`);
            return this.linearBlend(img1, img2, 0.5, 0.5, 0.499, 0.499).publish();
        }
        return '';
    }

    async updateIndicator(card) {
        this.colorIdentityImage = await this.getIndicatorImage(card);
        this.requestRender();
    }

    bind(card, watch) {
        watch(card, 'colorIdentity', () => this.updateIndicator(card));
    }

    render(card) {
        return this.colorIdentityImage && (
            `<img src="${this.colorIdentityImage}">`
        );
    }

    async styles() {
        return [await this.loadFile('style.css')];
    }
}
