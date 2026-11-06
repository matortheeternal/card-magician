import fs from 'node:fs/promises';
import path from 'node:path';
import { kinds, validId } from './extensionMetadata.js';
import { statIfExists } from './ExtensionPaths.js';

async function searchableDirectory(directory) {
    const stat = await statIfExists(directory);
    return stat && stat.isDirectory() && !stat.isSymbolicLink();
}

export default class ExtensionInventory {
    extensions = new Map();
    warnings = [];

    async scan(environment) {
        await this.scanRoot(path.join(environment.paths.plugins, 'extensions'), true);
        await this.scanRoot(environment.paths.userExtensions, false);
        return { extensions: [...this.extensions.values()], warnings: this.warnings };
    }

    async scanRoot(root, bundled) {
        for (const [type, [folder, manifest]] of Object.entries(kinds))
            await this.visit(path.join(root, folder), { type, manifest, bundled });
    }

    async visit(directory, context) {
        if (!await searchableDirectory(directory)) return;
        if (await statIfExists(path.join(directory, context.manifest))) {
            await this.readExtension(directory, context);
            return;
        }
        const entries = await fs.readdir(directory, { withFileTypes: true });
        for (const entry of entries) {
            if (!entry.isDirectory()) continue;
            await this.visit(path.join(directory, entry.name), context);
        }
    }

    async readExtension(directory, { type, manifest, bundled }) {
        try {
            const metadata = JSON.parse(await fs.readFile(
                path.join(directory, manifest), 'utf8'));
            if (!validId(metadata.id)) throw new Error('Invalid ID');
            this.add(metadata, type, bundled);
        } catch { this.warnings.push(`Could not read ${directory}`); }
    }

    add(metadata, type, bundled) {
        const previous = this.extensions.get(metadata.id);
        this.extensions.set(metadata.id, {
            id: metadata.id, type, metadata, version: metadata.version, bundled,
            hasBundled: bundled || !!previous?.hasBundled,
            bundledVersion: bundled ? metadata.version : previous?.bundledVersion
        });
    }
}
