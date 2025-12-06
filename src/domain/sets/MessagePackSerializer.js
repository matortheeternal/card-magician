import { encode as msgpackEncode, decode as msgpackDecode } from 'notepack.io';
import BinarySerializer from './BinarySerializer.js';

export default class MessagePackSerializer extends BinarySerializer {
    static matches(filePath) {
        return /\.msgpack$/i.test(filePath);
    }

    async encode(value) {
        const buffer = msgpackEncode(value);
        return new Uint8Array(buffer, 0, Math.min(buffer.byteLength, 10 * 1024 * 1024));
    }

    async decode(buffer) {
        return msgpackDecode(buffer);
    }
}
