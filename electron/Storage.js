import fs from 'node:fs/promises';
import path from 'node:path';
import { writeFile } from './atomicFile.js';

export default class Storage {
    constructor(dataPath) {
        this.folder = path.join(dataPath, 'storage');
    }

    filename(key) {
        if (typeof key !== 'string' || !key) throw new Error('Invalid storage key');
        return path.join(this.folder, Buffer.from(key).toString('hex') + '.json');
    }

    async get(key) {
        try {
            return JSON.parse(await fs.readFile(this.filename(key), 'utf8'));
        } catch (error) {
            if (error.code === 'ENOENT') return '{}';
            throw error;
        }
    }

    set(key, value) {
        return writeFile(this.filename(key), JSON.stringify(value));
    }

    clear() {
        return fs.rm(this.folder, { recursive: true, force: true });
    }
}
