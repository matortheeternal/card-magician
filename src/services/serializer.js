import ObjectURLAdapter from './objectUrlAdapter.js';

const defaultAdapters = [
    new ObjectURLAdapter()
];

/**
 * Abstract base class for serializers that use type adapters to transform
 * an arbitrary object graph into an intermediate representation, and then
 * into a final encoded format (JSON, binary, etc.).
 */
export default class Serializer {
    /**
     * @param {Array<SerializerAdapter>} [adapters=null]
     *   List of serialization adapters.
     */
    constructor(adapters = null) {
        /** @type {Array<SerializerAdapter>} */
        this.adapters = adapters || defaultAdapters;
    }

    /**
     * Encode the intermediate representation into the final serialized form.
     * Subclasses must implement this.
     *
     * @abstract
     * @param {any} value - The intermediate representation.
     * @returns {Promise<any>}
     */
    async encode(value) {
        throw new Error('Not implemented');
    }

    /**
     * Decode a serialized payload into the intermediate representation.
     * Subclasses must implement this.
     *
     * @abstract
     * @param {any} value - The encoded payload.
     * @returns {Promise<any>}
     */
    async decode(value) {
        throw new Error('Not implemented');
    }

    /**
     * Serialize an object by converting it through intermediate representation
     * and then through the specific format encoder.
     *
     * @param {any} value - The object to serialize.
     * @returns {Promise<any>} The serialized payload.
     */
    async serialize(value) {
        const intermediate = await this.encodeNode(value);
        return this.encode(intermediate);
    }

    /**
     * Deserialize a payload by decoding the format and then reconstructing
     * the object graph using adapters.
     *
     * @param {any} value - Serialized payload.
     * @returns {Promise<any>} The fully reconstructed value.
     */
    async deserialize(value) {
        const intermediate = await this.decode(value);
        return this.decodeNode(intermediate);
    }

    /**
     * Encode a plain object (non-array, non-special-type).
     *
     * @param {object} value
     * @returns {Promise<object>}
     */
    async encodeObject(value) {
        const out = {};
        for (const [k, v] of Object.entries(value))
            out[k] = await this.encodeNode(v);
        return out;
    }

    /**
     * Encode an arbitrary value by detecting adapters or falling back to
     * object/array recursion.
     *
     * @param {any} value
     * @returns {Promise<any>}
     */
    async encodeNode(value) {
        for (const adapter of this.adapters)
            if (adapter.canEncode(value))
                return adapter.encode(value, this);

        if (Array.isArray(value))
            return Promise.all(value.map(v => this.encodeNode(v)));

        if (value && typeof value === 'object')
            return await this.encodeObject(value);

        return value;
    }

    /**
     * Decode a plain object (non-array, non-adapted node).
     *
     * @param {object} node
     * @returns {Promise<object>}
     */
    async decodeObject(node) {
        const out = {};
        for (const [k, v] of Object.entries(node))
            out[k] = await this.decodeNode(v);
        return out;
    }

    /**
     * Decode an arbitrary node by using adapters or recursively descending
     * into arrays and objects.
     *
     * @param {any} node
     * @returns {Promise<any>}
     */
    async decodeNode(node) {
        if (!node) return node;
        const adapter = this.adapters.find(a => a.canDecode(node));
        if (adapter) return await adapter.decode(node, this);

        if (Array.isArray(node))
            return Promise.all(node.map(n => this.decodeNode(n)));

        if (node && typeof node === 'object')
            return await this.decodeObject(node);

        return node;
    }
}
