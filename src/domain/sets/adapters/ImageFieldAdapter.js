import SerializerAdapter from './SerializerAdapter.js';
import ImageFieldValue from '../../card/ImageFieldValue.js';

/**
 * Adapter for encoding/decoding image field values.
 */
export default class ImageFieldAdapter extends SerializerAdapter {
    nodeType = 'image';

    canDecode(node) {
        return node.__type === this.nodeType;
    }

    canEncode(value) {
        return value instanceof ImageFieldValue;
    }

    /**
     * Encode an ImageFieldValue into an object.
     * @param {ImageFieldValue} value
     * @returns {Promise<object>}
     */
    async encode(value) {
        return {
            __type: this.nodeType,
            ...await value.save()
        };
    }

    /**
     * Decode an object into an ImageFieldValue.
     *
     * @param {object} node
     * @returns {Promise<ImageFieldValue>} A new ImageFieldValue.
     */
    async decode(node) {
        return ImageFieldValue.load(node);
    }
}
