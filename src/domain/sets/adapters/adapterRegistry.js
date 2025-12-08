import ObjectUrlAdapter from './ObjectUrlAdapter.js';
import ObjectUrlBinaryAdapter from './ObjectUrlBinaryAdapter.js';

const adapters = new Set();
const binaryAdapters = new Set();

export function registerAdapter(Adapter) {
    adapters.add(new Adapter());
}

export function registerBinaryAdapter(Adapter) {
    binaryAdapters.add(new Adapter());
}

export function getAdapters() {
    return [...adapters];
}

export function getBinaryAdapters() {
    return [...binaryAdapters];
}

registerAdapter(ObjectUrlAdapter);
registerBinaryAdapter(ObjectUrlBinaryAdapter);
