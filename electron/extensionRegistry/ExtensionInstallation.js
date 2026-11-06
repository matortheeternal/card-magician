import fs from 'node:fs/promises';
import path from 'node:path';
import { extractFiles } from './ExtensionArchive.js';
import { statIfExists } from './ExtensionPaths.js';

/** Stage a validated package and replace its installation with rollback. */
export default class ExtensionInstallation {
    moved = false;
    preserveBackup = false;

    constructor(registry, id, type, target) {
        this.registry = registry;
        this.id = id;
        this.type = type;
        this.target = target;
    }

    async install(files) {
        this.temporary = await fs.mkdtemp(path.join(
            this.registry.environment.paths.userExtensions, '.registry-'));
        this.staged = path.join(this.temporary, 'new');
        this.backup = path.join(this.temporary, 'old');
        try {
            await extractFiles(files, this.staged);
            await this.replace();
        } finally {
            if (!this.preserveBackup)
                await fs.rm(this.temporary, { recursive: true, force: true });
        }
    }

    async replace() {
        await fs.mkdir(path.dirname(this.target), { recursive: true });
        // Recheck paths after extraction, before moving an existing installation.
        await this.registry.target(this.id, this.type);
        if (await statIfExists(this.target)) {
            await fs.rename(this.target, this.backup);
            this.moved = true;
        }
        try { await fs.rename(this.staged, this.target); } catch (error) {
            await this.restore();
            throw error;
        }
    }

    async restore() {
        if (!this.moved) return;
        try { await fs.rename(this.backup, this.target); } catch {
            this.preserveBackup = true;
            throw new Error(`Restore failed. Previous files: ${this.backup}`);
        }
    }
}
