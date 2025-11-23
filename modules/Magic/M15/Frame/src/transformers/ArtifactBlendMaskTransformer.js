import ColorBlendTransformer from './ColorBlendTransformer.js';
import ColoredProvider from '../providers/ColoredProvider.js';

class ArtifactBlendMaskTransformer extends ColorBlendTransformer {
    static matches(card, spout) {
        return spout.provider instanceof ColoredProvider
            && card.isArtifact?.();
    }

    async apply() {
        const maskPath = this.getBlendMaskPath('artifact');
        const maskUrl = this.resolveAsset(maskPath);
        const baseUrl = await this.target.apply();
        const artifactUrl = await this.provider.resolve('a');
        return await this.ctx.maskedBlend(baseUrl, artifactUrl, maskUrl);
    }
}

export default ArtifactBlendMaskTransformer;
