import Transformer from './Transformer.js';

/**
 * @abstract
 */
export default class ColorBlendTransformer extends Transformer {
    getBlendMaskPath(key) {
        return `${this.provider.maskFolder}/blend_${key}.png`;
    }

    get colorKey() {
        if (this.card.hybridStyle === 'gold')
            return 'm';
        if (this.card.hybridStyle === 'grey')
            return 'c';
    }
}
