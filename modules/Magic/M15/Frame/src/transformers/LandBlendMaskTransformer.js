import ColorBlendTransformer from './ColorBlendTransformer.js';
import ColoredProvider from '../providers/ColoredProvider.js';

export default class LandBlendMaskTransformer extends ColorBlendTransformer {
    static matches(card, spout) {
        return spout.provider instanceof ColoredProvider
            && card.isLand?.()
            && card.hybridStyle !== 'hybrid'
            && card.colorIdentity?.isMulticolor();
    }

    async apply() {
        const maskPath = this.getBlendMaskPath('hybrid')
        const maskUrl = this.resolveAsset(maskPath);
        const [imgToMaskUrl, imgUrl] = await Promise.all([
            this.target.apply(),
            this.provider.resolve(this.colorKey)
        ]);
        return await this.ctx.maskedBlend(imgToMaskUrl, imgUrl, maskUrl);
    }
}
