import SerializerAdapter from './SerializerAdapter.js';

export default class BaseNameAdapter extends SerializerAdapter {
    canDecode(node) {
        return false;
    }

    canEncode(value) {
        return value && typeof value === 'object'
            && (Object.hasOwn(value, 'baseName')
            || Object.hasOwn(value, 'files'));
    }

    async encode(value, serializer) {
        const v = { ... value };
        delete v.baseName;
        delete v.files;
        return serializer.encodeNode(v);
    }

    async decode(node) {
        throw new Error('Not implemented');
    }
}
