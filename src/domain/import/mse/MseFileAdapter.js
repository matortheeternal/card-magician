import { unzip } from 'unzipit';
import MseProjectAdapter from './MseProjectAdapter.js';
import { readBinaryFile } from '../../../shared/neutralinoAdapter.js';

export default class MseFileAdapter extends MseProjectAdapter {
    static async load(filePath) {
        const adapter = new this();
        const buffer = await readBinaryFile(filePath);
        const { entries } = await unzip(new Uint8Array(buffer));
        adapter.entries = entries;
        return adapter;
    }

    async rawSetText() {
        return this._rawSetText ||= (await this.entries['set'].text());
    }

    getMimeType(filename) {
        if (filename.endsWith('.png'))
            return 'image/png';
        if (filename.endsWith('.jpg'))
            return 'image/jpeg';
        throw new Error(`Unrecognized image type, "${filename}"`);
    }

    async getImage(filename) {
        const mime = this.getMimeType(filename);
        return await this.entries[filename].blob(mime);
    }
}
