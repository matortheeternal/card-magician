import { unzip } from 'unzipit';
import MseProjectAdapter from './MseProjectAdapter.js';
import { determineImageType } from '../../../shared/imageUtils.js';
import platform from '../../../shared/platformAdapter.js';

export default class MseFileAdapter extends MseProjectAdapter {
    static async load(filePath) {
        const adapter = new this();
        const buffer = await platform.readBinaryFile(filePath);
        const { entries } = await unzip(new Uint8Array(buffer));
        adapter.entries = entries;
        return adapter;
    }

    async rawSetText() {
        return this._rawSetText ||= (await this.entries['set'].text());
    }

    async entryText(filename) {
        const entry = this.entries[filename];
        if (!entry) throw new Error(`Missing MSE archive entry: "${filename}"`);
        return await entry.text();
    }

    async getImage(filename) {
        const buffer = await this.entries[filename].arrayBuffer();
        return new Blob([buffer], { type: determineImageType(buffer) });
    }
}
