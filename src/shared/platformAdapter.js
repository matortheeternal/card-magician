import safeStringify from './thePrinter.js';

// The renderer has no Node access. All native work goes through the preload bridge.
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

export function debugLog(level, message, args) {
    const details = args.map(value => safeStringify(value)).join('\n');
    return call('debugLog', `[${level}] ${message}\n${details}\n`);
}
export const openUrl = url => call('openUrl', url);
export const sysopen = path => call('open', path);
export const openSvgEditor = (executable, filename) => {
    return call('openSvgEditor', executable, filename);
};
export const openSingleFileDialog = (label, filters) => {
    return call('openSingleFileDialog', label, filters);
};
export const openFolderDialog = label => call('openFolderDialog', label);
export const saveSingleFileDialog = (label, defaultPath, filters) => {
    return call('saveSingleFileDialog', label, defaultPath, filters);
};
export const getStoredData = key => call('getStoredData', key);
export const storeData = (key, value) => call('storeData', key, value);
export const clearStoredData = () => call('clearStoredData');
export const filesystem = {
    readDirectory: (...args) => call('readDirectory', ...args),
    readFile: (...args) => call('readFile', ...args),
    writeFile: (...args) => call('writeFile', ...args),
    writeBinaryFile: (...args) => call('writeBinaryFile', ...args),
    readBinaryFile: (...args) => call('readBinaryFile', ...args),
    getAbsolutePath: (...args) => call('getAbsolutePath', ...args),
    getStats: (...args) => call('getStats', ...args),
    checkFileExists: (...args) => call('checkFileExists', ...args),
    checkFolderExists: (...args) => call('checkFolderExists', ...args),
    getJoinedPath: (...args) => call('getJoinedPath', ...args),
    getPathParts: (...args) => call('getPathParts', ...args),
    moveFile: (...args) => call('moveFile', ...args),
    copyFile: (...args) => call('copyFile', ...args),
    createDirectory: (...args) => call('createDirectory', ...args),
    rmrf: (...args) => call('rmrf', ...args)
};

export const readDirectory = (...args) => filesystem.readDirectory(...args);
export const readFile = (...args) => filesystem.readFile(...args);
export const writeFile = (...args) => filesystem.writeFile(...args);
export const writeBinaryFile = (...args) => filesystem.writeBinaryFile(...args);
export async function readBinaryFile(path) {
    const bytes = await filesystem.readBinaryFile(path);
    return new Uint8Array(bytes).buffer;
}
export const getAbsolutePath = (...args) => filesystem.getAbsolutePath(...args);
export const getStats = (...args) => filesystem.getStats(...args);
export const checkFileExists = (...args) => filesystem.checkFileExists(...args);
export const checkFolderExists = (...args) => filesystem.checkFolderExists(...args);
export const getJoinedPath = (...args) => filesystem.getJoinedPath(...args);
export const getPathParts = (...args) => filesystem.getPathParts(...args);
export const moveFile = (...args) => filesystem.moveFile(...args);
export const copyFile = (...args) => filesystem.copyFile(...args);
export const createDirectory = (...args) => filesystem.createDirectory(...args);
export const rmrf = (...args) => filesystem.rmrf(...args);
export async function getParentPath(path) {
    return (await getPathParts(path)).parentPath;
}
export const getMounts = () => call('getMounts');
export const mount = (path, target) => call('mount', path, target);
export const unmount = path => call('unmount', path);
export const writeProcessOutput = data => call('writeProcessOutput', data);
export const writeProcessError = data => call('writeProcessError', data);
export const terminateApp = (code = 0) => call('terminateApp', code);
export async function onWindowClose(callback) {
    native.onClose(callback);
    await call('readyToClose');
}
export const reloadApp = () => window.location.reload();
