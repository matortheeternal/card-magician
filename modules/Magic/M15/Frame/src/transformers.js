import Spout from './Spout.js';
import { CrownProvider, FrameProvider, NyxTrimProvider } from './providers.js';

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

    useDoubleTrim() {
        return this.allSpouts.some(spout => {
            return spout.hasSpout(s => {
                return s.provider.zIndex <= this.provider.zIndex
                    && s instanceof TrimMaskTransformer;
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
        const maskURL = await this.assetURL('mask/trim/devoid.png');
        return await this.utils.maskImage(baseURL, maskURL);
    }

    async apply() {
        const maskPath = `mask/${this.folder}/${this.filename}`;
        const maskUrl = await this.assetURL(maskPath);
        const baseUrl = await this.resolveBase();
        return await this.utils.maskImage(baseUrl, maskUrl);
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
        const baseUrl = await this.target.apply();
        const maskPath = `mask/frame/${this.maskFileName}`;
        const maskUrl = await this.assetURL(maskPath);
        return await this.utils.maskImage(baseUrl, maskUrl);
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

/**
 * @abstract
 */
class ColorBlendTransformer extends Transformer {
    getBlendMaskPath(key) {
        return `${this.provider.maskFolder}/blend_${key}.png`;
    }

    get maskHybridWithGold() {
        // TODO: controlled by style config
        return true;
    }
}

class LandBlendMaskTransformer extends ColorBlendTransformer {
    static matches(card, spout) {
        return spout.provider instanceof ColoredProvider
            && card.isLand?.()
            && card.colorIdentity?.isMulticolor();
    }

    async apply() {
        const maskPath = this.getBlendMaskPath('hybrid')
        const maskUrl = await this.assetURL(maskPath);
        const baseUrl = await this.target.apply();
        const multicolorUrl = await this.provider.resolve('m');
        const [imgToMaskUrl, imgUrl] = this.maskHybridWithGold
            ? [multicolorUrl, baseUrl]
            : [baseUrl, multicolorUrl];
        return await this.utils.maskedBlend(imgToMaskUrl, imgUrl, maskUrl);
    }
}

class MulticolorBlendMaskTransformer extends ColorBlendTransformer {
    static matches(card, spout) {
        return spout.provider instanceof ColoredProvider
            && !card.isLand?.()
            && card.colorIdentity?.isMulticolor();
    }

    async apply() {
        const maskPath = this.getBlendMaskPath('multicolor');
        const maskUrl = await this.assetURL(maskPath);
        const baseUrl = await this.target.apply();
        const multicolorUrl = await this.provider.resolve('m');
        return await this.utils.maskedBlend(multicolorUrl, baseUrl, maskUrl);
    }
}

class HybridBlendMaskTransformer extends ColorBlendTransformer {
    static matches(card, spout) {
        return spout.provider instanceof ColoredProvider
            && card.isHybrid?.();
    }

    get colorKey() {
        return this.maskHybridWithGold ? 'm' : 'c';
    }

    async apply() {
        const maskPath = this.getBlendMaskPath('hybrid');
        const maskUrl = await this.assetURL(maskPath);
        const baseUrl = await this.target.apply();
        const colorUrl = await this.provider.resolve(this.colorKey);
        return await this.utils.maskedBlend(colorUrl, baseUrl, maskUrl);
    }
}

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
        return await this.utils.maskedBlend(artifactUrl, baseUrl, maskUrl);
    }
}

export default [
    LandBlendMaskTransformer,
    MulticolorBlendMaskTransformer,
    HybridBlendMaskTransformer,
    ArtifactBlendMaskTransformer,
    FrameMaskTransformer,
    TrimMaskTransformer,
    CrownMaskTransformer
];
