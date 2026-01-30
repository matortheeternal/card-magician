import safeStringify from './thePrinter.js';

const levelToLogType = {
    info: 'INFO',
    warn: 'WARNING',
    error: 'ERROR',
};

export async function debugLog(level, message, args) {
    const type = levelToLogType[level] ?? 'INFO';
    const messageWithArgs = message + args.map(arg => {
        return `\n${safeStringify(arg)}`;
    }).join('');
    return Neutralino.debug.log(messageWithArgs, type);
}

export async function openSingleFileDialog(label, filters) {
    log('fs').debug('openSingleFileDialog', label, filters);
    const res = await Neutralino.os.showOpenDialog(label, { filters });
    return res?.[0];
}

export async function saveSingleFileDialog(label, defaultPath, filters) {
    log('fs').debug('saveSingleFileDialog', label, defaultPath, filters);
    return Neutralino.os.showSaveDialog(label, { defaultPath, filters });
}

export async function getStoredData(key) {
    log('fs').debug('storage.getData', key);
    return Neutralino.storage.getData(key);
}

export async function storeData(key, value) {
    log('fs').debug('storage.storeData', key, value);
    return Neutralino.storage.setData(key, value);
}

export async function readDirectory(path, options) {
    log('fs').debug('readDirectory', path, options);
    return Neutralino.filesystem.readDirectory(path, options);
}

export async function readFile(path) {
    log('fs').debug('readFile', path);
    return Neutralino.filesystem.readFile(path);
}

export async function writeFile(path, data) {
    log('fs').debug('writeFile', path, `${data.length} bytes`);
    return Neutralino.filesystem.writeFile(path, data);
}

export async function writeBinaryFile(path, data) {
    log('fs').debug('writeBinaryFile', path, `${data.length} bytes`);
    return Neutralino.filesystem.writeBinaryFile(path, data);
}

export async function readBinaryFile(path) {
    log('fs').debug('readBinaryFile', path);
    return Neutralino.filesystem.readBinaryFile(path);
}

export async function getAbsolutePath(path) {
    log('fs').debug('getAbsolutePath', path);
    return Neutralino.filesystem.getAbsolutePath(path);
}

export async function open(path) {
    log('fs').debug('open', path);
    return Neutralino.os.open(path);
}

export async function getStats(path) {
    log('fs').debug('getStats', path);
    return Neutralino.filesystem.getStats(path);
}

export async function getJoinedPath(...paths) {
    log('fs').debug('getJoinedPath', paths);
    return Neutralino.filesystem.getJoinedPath(...paths);
}

export async function createDirectory(path) {
    log('fs').debug('createDirectory', path);
    return Neutralino.filesystem.createDirectory(path);
}

export async function rmrf(path) {
    log('fs').debug('remove', path);
    return Neutralino.filesystem.remove(path);
}

export async function mount(path, target) {
    log('fs').debug('mount', path, target);
    try {
        await Neutralino.server.mount(path, target);
    } catch (error) {
        if (error.code !== 'NE_SR_MPINUSE') throw error;
    }
}

export async function setWindowSize(options) {
    return Neutralino.window.setSize(options);
}

export async function initApp() {
    Neutralino.init();
    Neutralino.events.on('windowClose', () => Neutralino.app.exit(0));
    return new Promise((resolve) => {
        Neutralino.events.on('ready', () => resolve());
    });
}

export function exitApp(code = 0) {
    Neutralino.app.exit(code);
}
