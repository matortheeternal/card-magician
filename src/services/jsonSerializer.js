import Serializer from './serializer.js';

/**
 * Serializer using JSON as the final encoded format.
 * Produces JSON strings and parses them back.
 */
export default class JSONSerializer extends Serializer {
    /**
     * Convert the intermediate representation into JSON.
     *
     * @param {any} value - Intermediate representation.
     * @returns {Promise<string>}
     */
    async encode(value) {
        return JSON.stringify(value);
    }

    /**
     * Parse JSON into the intermediate representation.
     *
     * @param {string} value - JSON string.
     * @returns {Promise<any>}
     */
    async decode(value) {
        return JSON.parse(value);
    }
}
