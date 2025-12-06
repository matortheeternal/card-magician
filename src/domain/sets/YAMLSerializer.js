import Serializer from './Serializer.js';
import YAML from 'yaml';

/**
 * Serializer that converts the intermediate representation to/from YAML.
 */
export default class YAMLSerializer extends Serializer {
    static matches(filePath) {
        return /\.yml$/i.test(filePath);
    }

    /**
     * Encode the intermediate representation as YAML.
     *
     * @param {any} value - Intermediate representation.
     * @returns {Promise<string>}
     */
    async encode(value) {
        return YAML.stringify(value);
    }

    /**
     * Decode YAML back into the intermediate representation.
     *
     * @param {string} yaml - YAML string.
     * @returns {Promise<any>}
     */
    async decode(yaml) {
        return YAML.parse(yaml);
    }
}
