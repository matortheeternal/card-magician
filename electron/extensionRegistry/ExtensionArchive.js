import fs from 'node:fs/promises';
import path from 'node:path';
import { unzipRaw } from 'unzipit';
import { kinds, manifests, maxPackage, validId, versionOf }
    from './extensionMetadata.js';

function unsafeSegment(segment) {
    return !segment || segment === '.' || segment === '..'
        || /[. ]$/.test(segment)
        || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(segment);
}

function unsafeEntry(entry, name) {
    const mode = (entry.externalFileAttributes >>> 16) & 0o170000;
    return entry.encrypted || /[\\\x00:<>"|?*]/.test(name)
        || name.split('/').some(unsafeSegment)
        || (mode && ![0o100000, 0o40000].includes(mode));
}

function validateEntryPath(entry, seen) {
    const name = entry.name.replace(/\/$/, '');
    if (unsafeEntry(entry, name) || seen.has(name.toLowerCase()))
        throw new Error('Unsafe or duplicate package path.');
    seen.add(name.toLowerCase());
}

function validateEntries(entries) {
    if (!entries.length || entries.length > 10000)
        throw new Error('Invalid number of package entries.');
    let total = 0;
    const seen = new Set();
    for (const entry of entries) {
        validateEntryPath(entry, seen);
        total += entry.size;
        if (total > maxPackage) throw new Error('Expanded package exceeds 300 MiB.');
    }
}

async function readManifest(entries) {
    const candidates = entries.filter(e => manifests.has(e.name.split('/').at(-1)));
    if (candidates.length !== 1 || candidates[0].size > 1024 * 1024)
        throw new Error('A package must contain exactly one extension manifest.');
    return { entry: candidates[0], metadata: await candidates[0].json() };
}

function validateMetadata(metadata, id, version) {
    if (metadata.id !== id || versionOf(metadata.version) !== version)
        throw new Error('Package identity does not match the selected release.');
    if (metadata.gameId !== undefined && !validId(metadata.gameId))
        throw new Error('Invalid game ID.');
}

function packagePrefix(metadata, id, type, version) {
    validateMetadata(metadata, id, version);
    const [folder] = kinds[type];
    const gamePrefix = metadata.gameId ? metadata.gameId + '/' : '';
    return `${gamePrefix}${folder}/${id}/`;
}

export async function validateArchive(bytes, id, type, version) {
    const { entries } = await unzipRaw(bytes);
    validateEntries(entries);
    const { entry, metadata } = await readManifest(entries);
    const prefix = packagePrefix(metadata, id, type, version);
    const [, manifest] = kinds[type];
    if (entry.name !== prefix + manifest
        || entries.some(e => !e.name.startsWith(prefix)))
        throw new Error('Invalid package root.');
    return entries.filter(e => !e.isDirectory).map(entry => ({
        relative: entry.name.slice(prefix.length), entry
    }));
}

export async function extractFiles(files, staged) {
    await fs.mkdir(staged);
    for (const { relative, entry } of files) {
        const destination = path.join(staged, ...relative.split('/'));
        await fs.mkdir(path.dirname(destination), { recursive: true });
        const content = new Uint8Array(await entry.arrayBuffer());
        if (content.length !== entry.size)
            throw new Error('Invalid package file size.');
        await fs.writeFile(destination, content);
    }
}
