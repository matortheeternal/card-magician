import ColorBlendTransformer from './ColorBlendTransformer.js';
import ColoredProvider from '../providers/ColoredProvider.js';

class ArtifactBlendMaskTransformer extends ColorBlendTransformer {
    static matches(card, spout) {
        return spout.provider instanceof ColoredProvider
            && card.isArtifact?.();
    }

    async apply() {
        const maskPath = this.getBlendMaskPath('artifact');
        const maskUrl = await this.assetURL(maskPath);
        const baseUrl = await this.target.apply();
        const artifactUrl = await this.provider.resolve('a');
        return await this.utils.maskedBlend(baseUrl, artifactUrl, maskUrl);
    }
}

export default ArtifactBlendMaskTransformer;
