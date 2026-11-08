import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { writeFile } from './atomicFile.js';

const folders = ['scripts'];
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

function validEntry([name, value]) {
    return !path.isAbsolute(name) && !name.split(/[/\\]/).includes('..')
        && typeof value === 'string';
}

export default class ContentStore {
    constructor(source, destination, version) {
        Object.assign(this, { source, destination, version });
        this.manifestPath = path.join(destination, '.bundled-content.json');
    }

    async loadManifest() {
        try {
            const manifest = JSON.parse(await fs.readFile(this.manifestPath, 'utf8'));
            if (!manifest || typeof manifest.files !== 'object' || !manifest.files)
                return { files: {} };
            const files = Object.fromEntries(
                Object.entries(manifest.files).filter(validEntry)
            );
            return { version: manifest.version, files };
        } catch (error) {
            if (error.code === 'ENOENT' || error instanceof SyntaxError)
                return { files: {} };
            throw error;
        }
    }

    async readExisting(relative) {
        try {
            return await fs.readFile(path.join(this.destination, relative));
        } catch (error) {
            if (error.code === 'ENOENT') return null;
            throw error;
        }
    }

    async installFile(relative, previousHash) {
        const source = await fs.readFile(path.join(this.source, relative));
        const existing = await this.readExisting(relative);
        if (!existing || hash(existing) === previousHash)
            await writeFile(path.join(this.destination, relative), source);
        return hash(source);
    }

    async update() {
        const previous = await this.loadManifest();
        if (previous.version === this.version) return;
        const files = {};
        for (const folder of folders) {
            const entries = await fs.readdir(path.join(this.source, folder), {
                withFileTypes: true, recursive: true
            });
            for (const entry of entries) {
                if (!entry.isFile()) continue;
                const filename = path.join(entry.parentPath, entry.name);
                const relative = path.relative(this.source, filename)
                    .replaceAll(path.sep, '/');
                const oldHash = previous.files[relative];
                files[relative] = await this.installFile(relative, oldHash);
            }
        }
        await this.removeObsolete(previous.files, files);
        const manifest = JSON.stringify({ version: this.version, files });
        await writeFile(this.manifestPath, manifest);
    }

    async removeObsolete(previous, current) {
        for (const [relative, previousHash] of Object.entries(previous)) {
            if (!folders.includes(relative.split(/[/\\]/)[0])) continue;
            if (relative in current) continue;
            const existing = await this.readExisting(relative);
            if (existing && hash(existing) === previousHash)
                await fs.rm(path.join(this.destination, relative));
        }
    }
}
