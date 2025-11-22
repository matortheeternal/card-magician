import ColorBlendTransformer from './ColorBlendTransformer.js';
import ColoredProvider from '../providers/ColoredProvider.js';

class HybridBlendMaskTransformer extends ColorBlendTransformer {
    static matches(card, spout) {
        return spout.provider instanceof ColoredProvider
            && card.hybridStyle !== 'hybrid'
            && card.isHybrid?.();
    }

    async apply() {
        const maskPath = this.getBlendMaskPath('hybrid');
        const maskUrl = await this.assetURL(maskPath);
        const baseUrl = await this.target.apply();
        const colorUrl = await this.provider.resolve(this.colorKey);
        return await this.utils.maskedBlend(colorUrl, baseUrl, maskUrl);
    }
}

export default HybridBlendMaskTransformer;
