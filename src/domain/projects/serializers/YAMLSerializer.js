import Serializer from './Serializer.js';
import YAML from 'yaml';

const YAML_EXTENSION_PATTERN = /\.yml$/i;

export default class YAMLSerializer extends Serializer {
    static matches(filePath) {
        return YAML_EXTENSION_PATTERN.test(filePath);
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
