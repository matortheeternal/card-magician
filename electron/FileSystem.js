import fs from 'node:fs/promises';
import { stat } from 'node:fs';
import path from 'node:path';
import { writeFile } from './atomicFile.js';

export default class FileSystem {
    constructor(contentPath) {
        this.contentPath = contentPath;
    }

    absolute(filename) {
        if (typeof filename !== 'string' || !filename)
            throw new TypeError('A nonempty file path is required.');
        const normalized = path.normalize(filename);
        return path.resolve(this.contentPath, normalized);
    }

    async readDirectory(filename, { recursive = false } = {}) {
        const base = this.absolute(filename);
        const entries = await fs.readdir(base, { withFileTypes: true, recursive });
        return entries.map(entry => {
            const relative = path.relative(base, path.join(entry.parentPath, entry.name));
            return {
                entry: relative.replaceAll(path.sep, '/'),
                path: path.join(filename, relative).replaceAll(path.sep, '/'),
                type: entry.isDirectory() ? 'DIRECTORY' : 'FILE'
            };
        });
    }

    readFile(filename) {
        return fs.readFile(this.absolute(filename), 'utf8');
    }

    writeFile(filename, data) {
        return writeFile(this.absolute(filename), data);
    }

    async readBinaryFile(filename) {
        return new Uint8Array(await fs.readFile(this.absolute(filename)));
    }

    writeBinaryFile(filename, data) {
        return this.writeFile(filename, Buffer.from(data));
    }

    async getStats(filename) {
        const stats = await fs.stat(this.absolute(filename));
        return {
            isFile: stats.isFile(), isDirectory: stats.isDirectory(), size: stats.size,
            createdAt: stats.birthtimeMs, modifiedAt: stats.mtimeMs
        };
    }

    checkPath(filename, matches) {
        const target = this.absolute(filename);
        return new Promise((resolve, reject) => {
            stat(target, (error, stats) => {
                if (!error) return resolve(matches(stats));
                if (['ENOENT', 'ENOTDIR'].includes(error.code)) return resolve(false);
                reject(error);
            });
        });
    }

    checkFileExists(filename) {
        return this.checkPath(filename, stats => stats.isFile());
    }

    checkFolderExists(filename) {
        return this.checkPath(filename, stats => stats.isDirectory());
    }

    getAbsolutePath(filename) {
        return this.absolute(filename);
    }

    getJoinedPath(...parts) {
        return path.join(...parts);
    }

    getPathParts(filename) {
        const { dir, base, name, ext } = path.parse(filename);
        return { parentPath: dir, filename: base, stem: name, extension: ext };
    }

    moveFile(source, destination) {
        return fs.rename(this.absolute(source), this.absolute(destination));
    }

    copyFile(source, destination) {
        return fs.cp(this.absolute(source), this.absolute(destination), {
            recursive: true
        });
    }

    createDirectory(filename) {
        return fs.mkdir(this.absolute(filename), { recursive: true });
    }

    rmrf(filename) {
        return fs.rm(this.absolute(filename), { recursive: true, force: true });
    }
}
