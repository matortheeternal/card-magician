import ColorBlendTransformer from './ColorBlendTransformer.js';
import ColoredProvider from '../providers/ColoredProvider.js';

class MulticolorBlendMaskTransformer extends ColorBlendTransformer {
    static matches(card, spout) {
        return spout.provider instanceof ColoredProvider
            && !card.isLand?.()
            && card.colorIdentity?.isMulticolor();
    }

    async apply() {
        const maskPath = this.getBlendMaskPath('multicolor');
        const maskUrl = this.resolveAsset(maskPath);
        const baseUrl = await this.target.apply();
        const multicolorUrl = await this.provider.resolve('m');
        return await this.ctx.maskedBlend(baseUrl, multicolorUrl, maskUrl);
    }
}

export default MulticolorBlendMaskTransformer;
