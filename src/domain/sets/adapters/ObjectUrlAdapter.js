import SerializerAdapter from './SerializerAdapter.js';

/**
 * Convert a Blob to a base64-encoded string (without the data: prefix).
 * Uses FileReader under the hood.
 *
 * @param {Blob} blob - The Blob to convert.
 * @returns {Promise<string>} A promise resolving to the base64 data
 * (no MIME/type header).
 */
function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('"Failed to read blob'));
        reader.readAsDataURL(blob);
    });
}

/**
 * Adapter responsible for encoding and decoding object URLs (blob: URLs).
 * Converts the Blob behind the URL into a base64 intermediate representation.
 */
export default class ObjectUrlAdapter extends SerializerAdapter {
    nodeType = 'ObjectURL';

    canEncode(value) {
        return typeof value === 'string'
            && value.startsWith('blob:');
    }

    canDecode(node) {
        return node.__type === this.nodeType
            || /^(data:)+(image\/\w+);base64,/.test(node);
    }

    async encode(url) {
        const response = await fetch(url);
        const blob = await response.blob();
        const base64 = await blobToBase64(blob);

        return {
            __type: this.nodeType,
            data: base64
        };
    }

    async decode(node) {
        const res = await fetch(node.data || node);
        return URL.createObjectURL(await res.blob());
    }
}
