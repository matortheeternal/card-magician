import SerializerAdapter from './SerializerAdapter.js';
import ImageFieldValue from '../../card/ImageFieldValue.js';

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
     * @param {Serializer} serializer
     * @returns {Promise<object>}
     */
    async encode(value, serializer) {
        const node = {
            __type: this.nodeType,
            ...await value.save()
        };
        if (serializer.options?.embedImages && value.imageUrl) {
            node.imageUrl = value.imageUrl.startsWith('data:')
                ? value.imageUrl
                : await this.toDataUrl(value.imageUrl);
        }
        return node;
    }

    async toDataUrl(imageUrl) {
        const response = await fetch(imageUrl);
        if (!response.ok) throw new Error(`Failed to load image: ${response.status}`);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(blob);
        });
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
