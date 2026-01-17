import SerializerAdapter from './SerializerAdapter.js';

/**
 * Adapter for encoding/decoding object URLs as raw binary data.
 */
export default class ObjectUrlBinaryAdapter extends SerializerAdapter {
    nodeType = 'ObjectURL';

    canEncode(value) {
        return typeof value === 'string'
            && value.startsWith('blob:');
    }

    canDecode(node) {
        return node.__type === ObjectUrlBinaryAdapter.nodeType;
    }

    /**
     * Encode a blob: URL into raw binary representation.
     * @param {string} url
     * @returns {Promise<object>}
     */
    async encode(url) {
        const response = await fetch(url);
        const blob = await response.blob();
        const buffer = await blob.arrayBuffer();

        return {
            __type: ObjectUrlBinaryAdapter.nodeType,
            mime: blob.type,
            binary: buffer
        };
    }

    /**
     * Decode raw binary into a blob: URL.
     *
     * @param {object|string} node
     * @returns {Promise<string>} A new blob: URL
     */
    async decode(node) {
        const bytes = new Uint8Array(node.binary);
        const blob = new Blob([bytes], { type: node.mime });
        return URL.createObjectURL(blob);
    }
}
