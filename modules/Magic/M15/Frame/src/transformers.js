import Spout from './Spout.js';
import { CrownProvider, FrameProvider } from './providers.js';

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

    constructor(spout, spouts) {
        super(spout);
        this.allSpouts = spouts;
        this.target = spout;
        this.provider = spout.provider;
    }
}

export class TrimMaskTransformer extends Transformer {
    static matches(card, spout) {
        return spout.provider.isTrim;
    }

    async apply() {
        const maskUrl = await this.assetURL('mask/trim.png');
        const baseUrl = await this.target.apply();
        return await this.utils.maskImage(baseUrl, maskUrl);
    }
}

export class ArtifactBlendTransformer extends Transformer {
    static matches(card, spout) {
        return card.isArtifact()
            && spout.provider instanceof FrameProvider;
    }

    async apply() {
        const key = this.card.isLand() ? 'al' : 'a';
        const artifactPath = `${this.card.frameFolder}/${key}.jpg`;
        const artifactUrl = await this.assetURL(artifactPath);
        const maskUrl = await this.assetURL('mask/artifact_blend.png');
        const baseUrl = await this.target.apply();
        return await this.utils.maskedBlend(baseUrl, artifactUrl, maskUrl);
    }
}

export class FrameMaskTransformer extends Transformer {
    static matches(card, spout) {
        return spout.provider instanceof FrameProvider;
    }

    resolvePumaMutateMask() {
        const parts = [];
        if (this.card.isPuma?.()) parts.push('puma');
        if (this.card.isMutate?.()) parts.push('mutate');
        return (parts.join('_') || 'normal') + '.png';
    }

    get maskFileName() {
        if (this.card.isMap?.()) return 'map.png';
        if (this.card.isClear?.() || this.card.isDevoid?.())
            return 'clear.png';
        if (this.card.isEnergyLand?.()) return 'energy.png';
        if (this.card.usesExpandedArt?.() && this.card.isDKA?.())
            return 'expanded_dka.png';
        if (this.card.isBorderless?.() && this.card.isFrameless?.())
            return this.card.isMiracle?.()
                ? 'borderless_frameless_miracle.png'
                : 'borderless_frameless.png';
        if (this.card.usesExpandedArt?.()) return 'expanded.png';
        if (this.card.isDKA?.())
            return this.card.isClearTop?.()
                ? 'clear_tops_dka.png'
                : 'dka.png';
        if (this.card.isClearTop?.()) return 'clear_tops.png';
        return this.resolvePumaMutateMask();
    }

    async apply() {
        const base = await this.target.apply();
        const maskPath = `mask/frame/${this.maskFileName}`;
        const mask = await this.assetURL(maskPath);
        return await this.utils.maskImage(base, mask);
    }
}

export class DevoidTrimMaskTransformer extends Transformer {
    static matches(card, spout) {
        return card.isDevoid?.() && spout.provider.isTrim();
    }

    async apply() {
        const baseURL = await this.target.apply();
        const maskURL = await this.assetURL('mask/devoid_trim.png');
        return await this.utils.maskImage(baseURL, maskURL);
    }
}

export class CrownMaskTransformer extends Transformer {
    static matches(card, spout) {
        return spout.provider instanceof CrownProvider;
    }

    getMasks() {
        const c = this.card;
        const masks = [];
        const isExpanded = c.isDevoid?.() || c.usesExpandedArt?.() || c.isPuma?.();

        if (c.hasFaceSymbol?.())
            masks.push('mask/crown/face_symbol.png');
        if (c.isBorderless?.() && c.isFrameless?.() && c.isMiracle?.())
            masks.push('mask/crown/miracle_borderless.png');
        if (isExpanded && c.hasAlias?.())
            masks.push('mask/crown/expanded_alias.png');

        return masks;
    }

    async apply() {
        let imgURL = await this.target.apply();
        const masks = this.getMasks();
        for (const maskPath of masks) {
            const maskURL = await this.assetURL(maskPath);
            imgURL = await this.utils.maskImage(imgURL, maskURL);
        }
        return imgURL;
    }
}


export default [
    FrameMaskTransformer,
    ArtifactBlendTransformer,
    TrimMaskTransformer,
    DevoidTrimMaskTransformer,
    CrownMaskTransformer
];
