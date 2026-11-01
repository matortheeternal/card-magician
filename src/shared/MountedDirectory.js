import {
    checkFileExists, checkFolderExists, readDirectory, readFile, writeFile, mount
} from './platformAdapter.js';

export default class MountedDirectory {
    constructor(filePath, urlPath) {
        this.filePath = filePath;
        this.urlPath = urlPath;
    }

    resolvePath(relativePath = '') {
        return relativePath ? `${this.filePath}/${relativePath}` : this.filePath;
    }

    url(relativePath = '') {
        if (!relativePath) return this.urlPath;
        const encodedPath = relativePath.split('/').map(encodeURIComponent).join('/');
        return `${this.urlPath}/${encodedPath}`;
    }

    child(relativePath) {
        const filePath = this.resolvePath(relativePath);
        return new MountedDirectory(filePath, this.url(relativePath));
    }

    mount() {
        return mount(this.urlPath, this.filePath);
    }

    exists(filename) {
        return checkFileExists(this.resolvePath(filename));
    }

    existsDirectory() {
        return checkFolderExists(this.filePath);
    }

    readText(filename) {
        return readFile(this.resolvePath(filename));
    }

    async readJson(filename) {
        return JSON.parse(await this.readText(filename));
    }

    writeText(filename, text) {
        return writeFile(this.resolvePath(filename), text);
    }

    readDirectory(options) {
        return readDirectory(this.filePath, options);
    }
}
