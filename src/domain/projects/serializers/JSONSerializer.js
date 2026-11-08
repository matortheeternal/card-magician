import Serializer from './Serializer.js';

export default class JSONSerializer extends Serializer {
    static matches() {
        return true;
    }

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
