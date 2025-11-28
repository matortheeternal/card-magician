import Transformer from './Transformer.js';

export default class TrimMaskTransformer extends Transformer {
    static matches(card, spout) {
        return spout.provider.isTrim;
    }

    useDoubleTrim() {
        return this.allSpouts.some(spout => {
            return spout.hasSpout(s => {
                return s.provider.isTrim
                    && s.provider !== this.provider
                    && s.provider.zIndex < this.provider.zIndex;
            });
        });
    }

    get folder() {
        return this.useDoubleTrim() ? 'doubletrim' : 'trim';
    }

    get filename() {
        if (this.card.isSaga?.()) return 'saga.png';
        if (this.card.isDKA?.()) return 'fullart.png';
        if (this.card.isPuma?.()) return 'puma.png';
        return 'normal.png';
    }

    async resolveBase() {
        const baseURL = await this.target.apply();
        if (!this.card.isDevoid?.()) return baseURL;
        const maskURL = this.resolveAsset('mask/trim/devoid.png');
        return await this.ctx.maskImage(baseURL, maskURL);
    }

    async apply() {
        const maskPath = `mask/${this.folder}/${this.filename}`;
        const maskUrl = this.resolveAsset(maskPath);
        const baseUrl = await this.resolveBase();
        return await this.ctx.maskImage(baseUrl, maskUrl);
    }
}
