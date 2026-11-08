import { encode as msgpackEncode, decode as msgpackDecode } from 'notepack.io';
import BinarySerializer from './BinarySerializer.js';

const MESSAGE_PACK_EXTENSION_PATTERN = /\.msgpack$/i;

export default class MessagePackSerializer extends BinarySerializer {
    static matches(filePath) {
        return MESSAGE_PACK_EXTENSION_PATTERN.test(filePath);
    }

    async encode(value) {
        const buffer = msgpackEncode(value);
        return new Uint8Array(buffer, 0, Math.min(buffer.byteLength, 10 * 1024 * 1024));
    }

    async decode(buffer) {
        return msgpackDecode(buffer);
    }
}
