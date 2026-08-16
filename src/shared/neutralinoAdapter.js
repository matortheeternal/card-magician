import safeStringify from './thePrinter.js';

const levelToLogType = {
    info: 'INFO',
    warn: 'WARNING',
    error: 'ERROR',
};

async function wrapError(callback) {
    try {
        return await callback();
    } catch (error) {
        if (error instanceof Error) throw error;
        throw new Error(`${error.code} ${error.message}`);
    }
}

export async function debugLog(level, message, args) {
    const type = levelToLogType[level] ?? 'INFO';
    const messageWithArgs = message + args.map(arg => {
        return `\n${safeStringify(arg)}`;
    }).join('');
    return wrapError(
        () => Neutralino.debug.log(messageWithArgs, type)
    );
}

export async function openSingleFileDialog(label, filters) {
    log('fs').debug('openSingleFileDialog', label, filters);
    const res = await wrapError(
        () => Neutralino.os.showOpenDialog(label, { filters })
    );
    return res?.[0];
}

export async function openFolderDialog(label) {
    log('fs').debug('openFolderDialog', label);
    return wrapError(() => Neutralino.os.showFolderDialog(label));
}

export async function saveSingleFileDialog(label, defaultPath, filters) {
    log('fs').debug('saveSingleFileDialog', label, defaultPath, filters);
    return wrapError(
        () => Neutralino.os.showSaveDialog(label, { defaultPath, filters })
    );
}

export async function getStoredData(key) {
    log('fs').debug('storage.getData', key);
    return wrapError(() => Neutralino.storage.getData(key));
}

export async function storeData(key, value) {
    log('fs').debug('storage.storeData', key, value);
    return wrapError(() => Neutralino.storage.setData(key, value));
}

export async function readDirectory(path, options) {
    log('fs').debug('readDirectory', path, options);
    return wrapError(() => Neutralino.filesystem.readDirectory(path, options));
}

export async function readFile(path) {
    log('fs').debug('readFile', path);
    return wrapError(() => Neutralino.filesystem.readFile(path));
}

export async function writeFile(path, data) {
    log('fs').debug('writeFile', path, `${data.length} bytes`);
    return wrapError(async () => {
        const { parentPath } = await Neutralino.filesystem.getPathParts(path);
        await createDirectory(parentPath);
        await Neutralino.filesystem.writeFile(path, data);
    });
}

export async function writeBinaryFile(path, data) {
    log('fs').debug('writeBinaryFile', path, `${data.byteLength} bytes`);
    return wrapError(async () => {
        const { parentPath } = await Neutralino.filesystem.getPathParts(path);
        await createDirectory(parentPath);
        await Neutralino.filesystem.writeBinaryFile(path, data);
    });
}

export async function readBinaryFile(path) {
    log('fs').debug('readBinaryFile', path);
    return wrapError(() => Neutralino.filesystem.readBinaryFile(path));
}

export async function getAbsolutePath(path) {
    log('fs').debug('getAbsolutePath', path);
    return wrapError(() => Neutralino.filesystem.getAbsolutePath(path));
}

export async function open(path) {
    log('fs').debug('open', path);
    return wrapError(() => Neutralino.os.open(path));
}

export async function getStats(path) {
    log('fs').debug('getStats', path);
    return Neutralino.filesystem.getStats(path);
}

export async function getJoinedPath(...paths) {
    log('fs').debug('getJoinedPath', paths);
    return wrapError(() => Neutralino.filesystem.getJoinedPath(...paths));
}

export async function moveFile(source, destination) {
    log('fs').debug('moveFile', source, destination);
    return wrapError(() => Neutralino.filesystem.move(source, destination));
}

export async function createDirectory(path) {
    log('fs').debug('createDirectory', path);
    try {
        await Neutralino.filesystem.createDirectory(path);
    } catch (error) {
        if (error.code !== 'NE_FS_DIRCRER')
            throw new Error(`${error.code} ${error.message}`);
    }
}

export async function getPathParts(path) {
    log('fs').debug('getPathParts', path);
    return wrapError(() => Neutralino.filesystem.getPathParts(path));
}

export async function getParentPath(path) {
    const { parentPath } = await getPathParts(path);
    return parentPath;
}

export async function rmrf(path) {
    log('fs').debug('remove', path);
    return wrapError(() => Neutralino.filesystem.remove(path));
}

export async function getMounts() {
    log('fs').debug('getMounts');
    return wrapError(() => Neutralino.server.getMounts());
}

export async function unmount(path) {
    log('fs').debug('unmount', path);
    return wrapError(async () => {
        const mounts = await Neutralino.server.getMounts();
        if (!mounts[path]) return;
        await Neutralino.server.unmount(path);
        // This protects us from a timing bug which occurs when the code
        // tries to mount a path after unmounting it.
        await Neutralino.server.getMounts();
    });
}

export async function mount(path, target) {
    log('fs').debug('mount', path, target);
    try {
        await Neutralino.server.mount(path, target);
    } catch (error) {
        if (error.code !== 'NE_SR_MPINUSE')
            throw new Error(`${error.code} ${error.message}`);
    }
}

export async function setWindowSize(options) {
    return wrapError(() => Neutralino.window.setSize(options));
}

export async function initApp() {
    Neutralino.init();
    await Neutralino.events.on('windowClose', () => Neutralino.app.exit(0));
    return new Promise((resolve) => {
        Neutralino.events.on('ready', () => resolve());
    });
}

export function exitApp(code = 0) {
    Neutralino.app.exit(code);
}
