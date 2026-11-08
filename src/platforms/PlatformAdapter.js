/**
 * @typedef {object} DirectoryEntry
 * @property {string} entry Path relative to the listed directory.
 * @property {string} path Path including the listed directory.
 * @property {'DIRECTORY' | 'FILE'} type
 */

/**
 * @typedef {object} FileStats
 * @property {boolean} isFile
 * @property {boolean} isDirectory
 * @property {number} size Size in bytes.
 * @property {number} createdAt Creation time in milliseconds since the Unix epoch.
 * @property {number} modifiedAt Modification time in milliseconds since the Unix epoch.
 */

/**
 * @typedef {object} PathParts
 * @property {string} parentPath
 * @property {string} filename
 * @property {string} stem
 * @property {string} extension Includes the leading dot, or an empty string.
 */

/** Platform operations supplied by each host implementation.
 * @abstract
 */
export default class PlatformAdapter {
    /** @abstract */
    debugLog(level, message, args) {
        throw new Error('debugLog must be implemented');
    }

    /** @abstract */
    openUrl(url) {
        throw new Error('openUrl must be implemented');
    }

    /** @abstract */
    sysopen(path) {
        throw new Error('sysopen must be implemented');
    }

    /** @abstract */
    openSvgEditor(executable, filename) {
        throw new Error('openSvgEditor must be implemented');
    }

    /** @abstract */
    openSingleFileDialog(label, filters) {
        throw new Error('openSingleFileDialog must be implemented');
    }

    /** @abstract */
    openFolderDialog(label) {
        throw new Error('openFolderDialog must be implemented');
    }

    /** @abstract */
    saveSingleFileDialog(label, defaultPath, filters) {
        throw new Error('saveSingleFileDialog must be implemented');
    }

    /** @abstract */
    getStoredData(key) {
        throw new Error('getStoredData must be implemented');
    }

    /** @abstract */
    storeData(key, value) {
        throw new Error('storeData must be implemented');
    }

    /** @abstract */
    clearStoredData() {
        throw new Error('clearStoredData must be implemented');
    }

    /**
     * @abstract
     * @param {string} filename
     * @param {{ recursive?: boolean }} [options]
     * @returns {Promise<DirectoryEntry[]>}
     */
    readDirectory(filename, options = {}) {
        throw new Error('readDirectory must be implemented');
    }

    /**
     * @abstract
     * @param {string} filename
     * @returns {Promise<string>}
     */
    readFile(filename) {
        throw new Error('readFile must be implemented');
    }

    /**
     * @abstract
     * @param {string} filename
     * @param {string} data
     * @returns {Promise<void>}
     */
    writeFile(filename, data) {
        throw new Error('writeFile must be implemented');
    }

    /**
     * @abstract
     * @param {string} filename
     * @param {ArrayBuffer | Uint8Array} data
     * @returns {Promise<void>}
     */
    writeBinaryFile(filename, data) {
        throw new Error('writeBinaryFile must be implemented');
    }

    /**
     * @abstract
     * @param {string} filename
     * @returns {Promise<ArrayBuffer>}
     */
    readBinaryFile(filename) {
        throw new Error('readBinaryFile must be implemented');
    }

    /**
     * @abstract
     * @param {string} filename
     * @returns {Promise<string>}
     */
    getAbsolutePath(filename) {
        throw new Error('getAbsolutePath must be implemented');
    }

    /**
     * @abstract
     * @param {string} filename
     * @returns {Promise<FileStats>}
     */
    getStats(filename) {
        throw new Error('getStats must be implemented');
    }

    /**
     * @abstract
     * @param {string} filename
     * @returns {Promise<boolean>}
     */
    checkFileExists(filename) {
        throw new Error('checkFileExists must be implemented');
    }

    /**
     * @abstract
     * @param {string} filename
     * @returns {Promise<boolean>}
     */
    checkFolderExists(filename) {
        throw new Error('checkFolderExists must be implemented');
    }

    /**
     * @abstract
     * @param {...string} parts
     * @returns {Promise<string>}
     */
    getJoinedPath(...parts) {
        throw new Error('getJoinedPath must be implemented');
    }

    /**
     * @abstract
     * @param {string} filename
     * @returns {Promise<PathParts>}
     */
    getPathParts(filename) {
        throw new Error('getPathParts must be implemented');
    }

    /**
     * @abstract
     * @param {string} source
     * @param {string} destination
     * @returns {Promise<void>}
     */
    moveFile(source, destination) {
        throw new Error('moveFile must be implemented');
    }

    /**
     * @abstract
     * @param {string} source
     * @param {string} destination
     * @returns {Promise<void>}
     */
    copyFile(source, destination) {
        throw new Error('copyFile must be implemented');
    }

    /**
     * @abstract
     * @param {string} filename
     * @returns {Promise<string | undefined>}
     */
    createDirectory(filename) {
        throw new Error('createDirectory must be implemented');
    }

    /**
     * @abstract
     * @param {string} filename
     * @returns {Promise<void>}
     */
    rmrf(filename) {
        throw new Error('rmrf must be implemented');
    }

    /**
     * @abstract
     * @param {string} filename
     * @returns {Promise<string>}
     */
    getParentPath(filename) {
        throw new Error('getParentPath must be implemented');
    }

    /** @abstract */
    getMounts() {
        throw new Error('getMounts must be implemented');
    }

    /** @abstract */
    mount(path, target) {
        throw new Error('mount must be implemented');
    }

    /** @abstract */
    unmount(path) {
        throw new Error('unmount must be implemented');
    }

    /** @abstract */
    writeProcessOutput(data) {
        throw new Error('writeProcessOutput must be implemented');
    }

    /** @abstract */
    writeProcessError(data) {
        throw new Error('writeProcessError must be implemented');
    }

    /** @abstract */
    terminateApp(code = 0) {
        throw new Error('terminateApp must be implemented');
    }

    /** @abstract */
    onWindowClose(callback) {
        throw new Error('onWindowClose must be implemented');
    }

    /** @abstract */
    reloadApp() {
        throw new Error('reloadApp must be implemented');
    }

    /** @abstract */
    startFileWatch(id, filename) {
        throw new Error('startFileWatch must be implemented');
    }

    /** @abstract */
    stopFileWatch(id) {
        throw new Error('stopFileWatch must be implemented');
    }

    /** @abstract */
    onFileChange(callback) {
        throw new Error('onFileChange must be implemented');
    }

    /** @abstract */
    ready() {
        throw new Error('ready must be implemented');
    }

    /** @abstract */
    onOpenFile(callback) {
        throw new Error('onOpenFile must be implemented');
    }
}
