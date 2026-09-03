import {
    copyFile,
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
        def.refresh(filePath);
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
        return await getJoinedPath(this.cardsFolderPath, filename);
    }

    async moveToCanonicalPath(key) {
        const oldFilePath = this.get(key);
        if (!oldFilePath) return;
        const newFilePath = await this.getCanonicalPath(key);
        if (newFilePath === oldFilePath) return;
        await moveFile(oldFilePath, newFilePath);
        this.set(key, newFilePath);
    }

    async load(filesByName) {
        for (const def of this.definitions) {
            const filename = def.getFilename(this.card);
            const filePath = filesByName.get(filename.toLowerCase())
                || await def.getLegacyFilePath(this.card);
            if (!filePath) continue;
            this.paths.set(def.key, filePath);
            def.setFieldValue(this.card, filePath);
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

    copy() {
        const obj = {};
        for (const key of this.paths.keys()) {
            if (key === 'data') continue;
            obj[key] = this.paths.get(key);
        }
        return obj;
    }

    async paste(files) {
        for (const [key, value] of Object.entries(files)) {
            const newPath = await this.getCanonicalPath(key);
            await copyFile(value, newPath);
            const def = this.resolveDefinition(key);
            this.paths.set(key, newPath);
            def.setFieldValue(this.card, newPath);
        }
    }
}
