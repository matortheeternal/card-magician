import Transformer from './Transformer.js';
import FrameProvider from '../providers/FrameProvider.js';

export default class FrameMaskTransformer extends Transformer {
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
