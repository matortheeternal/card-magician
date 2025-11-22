import Transformer from './Transformer.js';
import CrownProvider from '../providers/CrownProvider.js';

export default class CrownMaskTransformer extends Transformer {
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
