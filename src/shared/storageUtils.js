import CollectionManager from './storage/CollectionManager.js';
import { beforeExit } from '../lifecycle.js';

const managers = [];

export function manageCollection(options) {
    const manager = new CollectionManager(options);
    managers.push(manager);
    return manager;
}

beforeExit(async () => {
    const results = await Promise.allSettled(managers.map(manager => manager.flush()));
    const failure = results.find(result => result.status === 'rejected');
    if (failure) throw failure.reason;
}, () => managers.some(manager => manager.pending));
