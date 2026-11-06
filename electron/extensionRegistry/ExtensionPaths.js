import fs from 'node:fs/promises';
import path from 'node:path';
import { kinds, manifests, validId } from './extensionMetadata.js';

export async function statIfExists(filename) {
    try { return await fs.lstat(filename); } catch (error) {
        if (error.code === 'ENOENT') return null;
        throw error;
    }
}

async function validateDirectory(directory) {
    const stat = await statIfExists(directory);
    if (stat && (stat.isSymbolicLink() || !stat.isDirectory()))
        throw new Error('Extension path is not a regular directory.');
}

async function validateParent(directory) {
    for (const name of manifests) {
        if (await statIfExists(path.join(directory, name)))
            throw new Error('Extension paths must not overlap.');
    }
}

async function validateExistingTarget(target, manifest, id) {
    if (!await statIfExists(target)) return;
    const filename = path.join(target, manifest);
    if (!await statIfExists(filename))
        throw new Error('Extension paths must not overlap.');
    const metadata = JSON.parse(await fs.readFile(filename, 'utf8'));
    if (metadata.id !== id) throw new Error('Extension paths must not overlap.');
}

export default class ExtensionPaths {
    constructor(root) {
        this.root = path.resolve(root);
    }

    async target(id, type) {
        if (!validId(id) || !Object.hasOwn(kinds, type))
            throw new Error('Invalid extension identity.');
        await fs.mkdir(this.root, { recursive: true });
        const [folder, manifest] = kinds[type];
        const parts = [folder, ...id.split('/')];
        const target = path.join(this.root, ...parts);
        await this.validateAncestors(parts, target);
        await validateExistingTarget(target, manifest, id);
        return target;
    }

    async validateAncestors(parts, target) {
        let current = this.root;
        for (const part of parts) {
            current = path.join(current, part);
            await validateDirectory(current);
            if (current !== target) await validateParent(current);
        }
    }
}
