import {
    getJoinedPath,
    moveFile,
    rmrf
} from '../../shared/neutralinoAdapter.js';

export default class CardFiles {
    constructor(card, definitions = {}) {
        this.paths = new Map();
        this.card = card;
        this.definitions = definitions;
    }

    get(key) {
        return this.paths.get(key);
    }

    has(key) {
        return this.paths.has(key);
    }

    set(key, filePath) {
        const def = this.resolveDefinition(key);
        this.paths.set(key, filePath);
        def.setFieldValue(this.card, filePath);
    }

    clear(key) {
        this.paths.delete(key);
    }

    get entries() {
        return this.paths.entries();
    }

    get fields() {
        const results = [];
        for (const def of this.definitions) {
            const field = def.getField(this.card);
            if (field) results.push([def.key, field]);
        }
        return results;
    }

    get cardsFolderPath() {
        return window.activeProject.cardsFolderPath;
    }

    async getCanonicalPath(key) {
        const def = this.resolveDefinition(key);
        const filename = def.getFilename(this.card);
        return getJoinedPath(this.cardsFolderPath, filename);
    }

    async moveToCanonicalPath(key) {
        const oldFilePath = this.get(key);
        if (!oldFilePath) return;
        const newFilePath = await this.getCanonicalPath(key);
        if (newFilePath !== oldFilePath)
            await moveFile(oldFilePath, newFilePath);
        this.set(key, newFilePath);
    }

    async load(filesByName) {
        for (const def of this.definitions) {
            const filename = def.getFilename(this.card);
            const filePath = filesByName.get(filename.toLowerCase())
                || await def.getLegacyFilePath(this.card);
            if (!filePath) continue;
            this.set(def.key, filePath);
        }
    }

    async remove(key) {
        const def = this.resolveDefinition(key);
        const filePath = this.get(key);
        if (filePath) await rmrf(filePath);
        this.paths.delete(key);
        def.clearFieldValue(this.card);
    }

    resolveDefinition(key) {
        const def = this.definitions.find(def => def.key === key);
        if (def) return def;
        throw new Error(`Unknown card file definition: ${key}`);
    }
}
