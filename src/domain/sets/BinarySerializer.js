import Serializer from './Serializer.js';
import ObjectUrlBinaryAdapter from './ObjectUrlBinaryAdapter.js';

const defaultBinaryAdapters = [
    new ObjectUrlBinaryAdapter()
];

/**
 * @abstract
 */
export default class BinarySerializer extends Serializer {
    static async save(filePath, data, options = {}) {
        const serializer = new this();
        const buffer = await serializer.serialize(data, options);
        await Neutralino.filesystem.writeBinaryFile(filePath, buffer);
    }

    static async load(filePath) {
        const serializer = new this();
        const buffer = await Neutralino.filesystem.readBinaryFile(filePath);
        return await serializer.deserialize(buffer);
    }

    constructor(adapters = defaultBinaryAdapters) {
        super(adapters);
    }
}
