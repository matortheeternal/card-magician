import MseProjectAdapter from './MseProjectAdapter.js';

export default class MseFolderAdapter extends MseProjectAdapter {
    async setInfo() {
        throw new Error('Not implemented');
    }

    async *card() {
        throw new Error('Not implemented');
    }
}
