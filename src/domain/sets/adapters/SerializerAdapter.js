/**
 * Abstract base class for all type adapters used by Serializer.
 * Adapters convert between runtime values and intermediate representation nodes.
 */
export default class SerializerAdapter {
    /**
     * Unique type identifier stored in the intermediate representation.
     * Subclasses must override this value.
     * @type {string}
     */
    type = 'BaseAdapter';

    /**
     * Determine whether this adapter can encode the given value.
     *
     * @abstract
     * @param {any} value - The runtime value to inspect.
     * @returns {boolean} True if this adapter should encode the value.
     */
    canEncode(value) {
        throw new Error('canEncode() must be implemented by subclass');
    }

    /**
     * Determine whether this adapter can decode the given node.
     *
     * @abstract
     * @param {any} node - The intermediate node to inspect.
     * @returns {boolean} True if this adapter should encode the value.
     */
    canDecode(node) {
        throw new Error('canDecode() must be implemented by subclass');
    }

    /**
     * Encode a runtime value into an intermediate representation node.
     *
     * @abstract
     * @param {any} value - The value to encode.
     * @param {Serializer} serializer - The serializer instance.
     * @returns {Promise<object>} The encoded intermediate node.
     */
    async encode(value, serializer) {
        throw new Error('encode() must be implemented by subclass');
    }

    /**
     * Decode an intermediate representation node back into a runtime value.
     *
     * @abstract
     * @param {object} node - The encoded node.
     * @param {Serializer} serializer - The serializer instance.
     * @returns {Promise<any>} The decoded runtime value.
     */
    async decode(node, serializer) {
        throw new Error('decode() must be implemented by subclass');
    }
}
