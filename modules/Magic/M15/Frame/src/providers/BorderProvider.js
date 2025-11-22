import Provider from './Provider.js';

export default class BorderProvider extends Provider {
    async resolve() {
        const borderMaskPath = this.card.isLegendary()
            ? 'mask/border/crown.png'
            : 'mask/border/base.png';
        const maskUrl = await this.assetURL(borderMaskPath);
        return await this.utils.maskColor(maskUrl, '#000000');
    }
}
