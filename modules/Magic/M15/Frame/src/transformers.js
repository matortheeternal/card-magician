import Spout from './Spout.js';

/**
 * @abstract
 */
export class Transformer extends Spout {
    /**
     * @abstract
     * @param card
     * @param resolver
     * @returns {boolean}
     */
    static matches(card, resolver) {
        return false;
    }

    constructor(resolverOrTransform) {
        super(resolverOrTransform);
        this.target = resolverOrTransform;
        this.provider = resolverOrTransform.provider;
    }
}

export class TrimMaskTransformer extends Transformer {
    static matches(card, resolverOrTransform) {
        return resolverOrTransform.provider.isTrim;
    }

    async apply() {
        const maskUrl = await this.assetURL('masks/trim.png');
        const baseUrl = await this.target.apply();
        return await this.utils.maskImage(baseUrl, maskUrl);
    }
}

export class ArtifactBlendTransformer extends Transformer {
    static matches(card, resolverOrTransform) {
        return card.isArtifact()
            && resolverOrTransform.provider instanceof FrameProvider;
    }

    async apply() {
        const key = this.card.isLand() ? 'al' : 'a';
        const artifactPath = `${this.card.frameFolder}/${key}.jpg`;
        const artifactUrl = await this.assetURL(artifactPath);
        const maskUrl = await this.assetURL('masks/blend/artifact.png');
        const baseUrl = await this.target.apply();
        return await this.utils.maskedBlend(baseUrl, artifactUrl, maskUrl);
    }
}

export default [
    ArtifactBlendTransformer,
    TrimMaskTransformer
];
