import SerializerAdapter from './SerializerAdapter.js';

/**
 * Adapter for removing "dirty" properties.
 */
export default class DirtyAdapter extends SerializerAdapter {
    canDecode(node) {
        return false;
    }

    canEncode(value) {
        return value && typeof value === 'object'
            && Object.hasOwn(value, 'dirty');
    }

    async encode(value, serializer) {
        delete value.dirty;
        return serializer.encodeNode(value);
    }

    async decode(node) {
        throw new Error('Not implemented');
    }
}
