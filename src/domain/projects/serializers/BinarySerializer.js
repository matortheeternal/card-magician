import Serializer from './Serializer.js';
import { getBinaryAdapters } from '../adapters/adapterRegistry.js';
import platform from '../../../shared/platformAdapter.js';

/**
 * @abstract
 */
export default class BinarySerializer extends Serializer {
    static async save(filePath, data, options = {}) {
        const serializer = new this();
        const buffer = await serializer.serialize(data, options);
        await platform.writeBinaryFile(filePath, buffer);
    }

    static async load(filePath) {
        const serializer = new this();
        const buffer = await platform.readBinaryFile(filePath);
        return serializer.deserialize(buffer);
    }

    constructor(adapters) {
        super(adapters || getBinaryAdapters());
    }
}
