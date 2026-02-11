import SerializerAdapter from './SerializerAdapter.js';
import { getActiveGame } from '../../game/gameManager.js';

/**
 * Adapter for encoding/decoding object URLs as raw binary data.
 */
export default class ManaCostAdapter extends SerializerAdapter {
    nodeType = 'ManaCost';

    canEncode(value) {
        return value && value.constructor.name === 'ManaCost';
    }

    canDecode(node) {
        return node.__type === this.nodeType;
    }

    /**
     * Encode a mana cost into an object
     * @param {ManaCost} manaCost
     * @returns {Promise<object>}
     */
    async encode(manaCost) {
        return {
            __type: this.nodeType,
            symbols: manaCost.toString()
        };
    }

    /**
     * Decode an object into a mana cost.
     *
     * @param {object} node
     * @returns {Promise<ManaCost>} A new mana cost.
     */
    async decode(node) {
        const { ManaCost } = getActiveGame().ManaScribe;
        return ManaCost.parse(node.symbols);
    }
}
