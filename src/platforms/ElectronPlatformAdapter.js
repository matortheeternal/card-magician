import PlatformAdapter from './PlatformAdapter.js';
import safeStringify from '../shared/thePrinter.js';

const native = window.cardMagicianNative;

async function call(operation, ...args) {
    const result = await native.call(operation, args);
    if (result.error) {
        const error = new Error(result.error.message);
        error.code = result.error.code;
        throw error;
    }
    return result.value;
}

export default class ElectronPlatformAdapter extends PlatformAdapter {
    debugLog(level, message, args) {
        const details = args.map(value => safeStringify(value)).join('\n');
        return call('debugLog', `[${level}] ${message}\n${details}\n`);
    }

    openUrl(url) {
        return call('openUrl', url);
    }

    sysopen(path) {
        return call('open', path);
    }

    openSvgEditor(executable, filename) {
        return call('openSvgEditor', executable, filename);
    }

    openSingleFileDialog(label, filters) {
        return call('openSingleFileDialog', label, filters);
    }

    openFolderDialog(label) {
        return call('openFolderDialog', label);
    }

    saveSingleFileDialog(label, defaultPath, filters) {
        return call('saveSingleFileDialog', label, defaultPath, filters);
    }

    getStoredData(key) {
        return call('getStoredData', key);
    }

    storeData(key, value) {
        return call('storeData', key, value);
    }

    clearStoredData() {
        return call('clearStoredData');
    }

    /**
     * @param {string} filename
     * @param {{ recursive?: boolean }} [options]
     * @returns {Promise<DirectoryEntry[]>}
     */
    readDirectory(filename, options = {}) {
        return call('readDirectory', filename, options);
    }

    /**
     * @param {string} filename
     * @returns {Promise<string>}
     */
    readFile(filename) {
        return call('readFile', filename);
    }

    /**
     * @param {string} filename
     * @param {string} data
     * @returns {Promise<void>}
     */
    writeFile(filename, data) {
        return call('writeFile', filename, data);
    }

    /**
     * @param {string} filename
     * @param {ArrayBuffer | Uint8Array} data
     * @returns {Promise<void>}
     */
    writeBinaryFile(filename, data) {
        return call('writeBinaryFile', filename, data);
    }

    /**
     * @param {string} filename
     * @returns {Promise<ArrayBuffer>}
     */
    async readBinaryFile(filename) {
        const bytes = await call('readBinaryFile', filename);
        return new Uint8Array(bytes).buffer;
    }

    /**
     * @param {string} filename
     * @returns {Promise<string>}
     */
    getAbsolutePath(filename) {
        return call('getAbsolutePath', filename);
    }

    /**
     * @param {string} filename
     * @returns {Promise<FileStats>}
     */
    getStats(filename) {
        return call('getStats', filename);
    }

    /**
     * @param {string} filename
     * @returns {Promise<boolean>}
     */
    checkFileExists(filename) {
        return call('checkFileExists', filename);
    }

    /**
     * @param {string} filename
     * @returns {Promise<boolean>}
     */
    checkFolderExists(filename) {
        return call('checkFolderExists', filename);
    }

    /**
     * @param {...string} parts
     * @returns {Promise<string>}
     */
    getJoinedPath(...parts) {
        return call('getJoinedPath', ...parts);
    }

    /**
     * @param {string} filename
     * @returns {Promise<PathParts>}
     */
    getPathParts(filename) {
        return call('getPathParts', filename);
    }

    /**
     * @param {string} source
     * @param {string} destination
     * @returns {Promise<void>}
     */
    moveFile(source, destination) {
        return call('moveFile', source, destination);
    }

    /**
     * @param {string} source
     * @param {string} destination
     * @returns {Promise<void>}
     */
    copyFile(source, destination) {
        return call('copyFile', source, destination);
    }

    /**
     * @param {string} filename
     * @returns {Promise<string | undefined>}
     */
    createDirectory(filename) {
        return call('createDirectory', filename);
    }

    /**
     * @param {string} filename
     * @returns {Promise<void>}
     */
    rmrf(filename) {
        return call('rmrf', filename);
    }

    /**
     * @param {string} filename
     * @returns {Promise<string>}
     */
    async getParentPath(filename) {
        return (await this.getPathParts(filename)).parentPath;
    }

    getMounts() {
        return call('getMounts');
    }

    mount(path, target) {
        return call('mount', path, target);
    }

    unmount(path) {
        return call('unmount', path);
    }

    writeProcessOutput(data) {
        return call('writeProcessOutput', data);
    }

    writeProcessError(data) {
        return call('writeProcessError', data);
    }

    terminateApp(code = 0) {
        return call('terminateApp', code);
    }

    async onWindowClose(callback) {
        native.onClose(callback);
        await call('readyToClose');
    }

    reloadApp() {
        return window.location.reload();
    }

    startFileWatch(id, filename) {
        return call('watchFile', id, filename);
    }

    stopFileWatch(id) {
        return call('unwatchFile', id);
    }

    onFileChange(callback) {
        return native.onFileChange(callback);
    }

    ready() {
        return native.ready();
    }

    onOpenFile(callback) {
        return native.onOpenFile(callback);
    }
}
