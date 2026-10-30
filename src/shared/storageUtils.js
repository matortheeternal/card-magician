import CollectionManager from './storage/CollectionManager.js';

const managers = [];

export function manageCollection(options) {
    const manager = new CollectionManager(options);
    managers.push(manager);
    return manager;
}
