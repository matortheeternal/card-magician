import platform from '../../shared/platformAdapter.js';

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

    async set(key, filePath) {
        const def = this.resolveDefinition(key);
        this.paths.set(key, filePath);
        await def.refresh(filePath);
        await def.setFieldValue(this.card, filePath);
    }

    clear(key) {
        this.paths.delete(key);
    }

    detach() {
        this.paths.clear();
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
        return await platform.getJoinedPath(this.cardsFolderPath, filename);
    }

    async moveToCanonicalPath(key) {
        const oldFilePath = this.get(key);
        if (!oldFilePath) return;
        const newFilePath = await this.getCanonicalPath(key);
        if (newFilePath === oldFilePath) return;
        await platform.moveFile(oldFilePath, newFilePath);
        await this.set(key, newFilePath);
    }

    async load(filesByName) {
        for (const def of this.definitions) {
            const filename = def.getFilename(this.card);
            const filePath = filesByName.get(filename.toLowerCase());
            if (!filePath) continue;
            this.paths.set(def.key, filePath);
            await def.setFieldValue(this.card, filePath);
        }
    }

    async remove(key) {
        const def = this.resolveDefinition(key);
        const filePath = this.get(key);
        if (filePath) await platform.rmrf(filePath);
        this.paths.delete(key);
        def.clearFieldValue(this.card);
    }

    resolveDefinition(key) {
        const def = this.definitions.find(def => def.key === key);
        if (def) return def;
        throw new Error(`Unknown card file definition: ${key}`);
    }

}
