export async function openSingleFileDialog(label, filters) {
    const res = await Neutralino.os.showOpenDialog(label, { filters });
    if (!res) return;
    return res[0];
}

export async function saveSingleFileDialog(label, defaultPath, filters) {
    return await Neutralino.os.showSaveDialog(label, { defaultPath, filters });
}

export async function getStoredData(key) {
    return await Neutralino.storage.getData(key);
}

export async function storeData(key, value) {
    return await Neutralino.storage.setData(key, value);
}

export async function readDirectory(path, options) {
    return await Neutralino.filesystem.readDirectory(path, options);
}

export async function readFile(path) {
    return await Neutralino.filesystem.readFile(path);
}

export async function writeFile(path, data) {
    return await Neutralino.filesystem.writeFile(path, data);
}

export async function writeBinaryFile(path, data) {
    return await Neutralino.filesystem.writeBinaryFile(path, data);
}

export async function readBinaryFile(path) {
    return await Neutralino.filesystem.readBinaryFile(path);
}

export async function getAbsolutePath(path) {
    return await Neutralino.filesystem.getAbsolutePath(path);
}

export async function open(path) {
    return await Neutralino.os.open(path);
}

export async function getStats(path) {
    return await Neutralino.filesystem.getStats(path);
}

export async function createDirectory(path) {
    return await Neutralino.filesystem.createDirectory(path);
}

export async function mount(path) {
    return await Neutralino.filesystem.mount(path);
}

export async function minimizeWindow() {
    return await Neutralino.window.minimize();
}

export async function maximizeWindow() {
    return await Neutralino.window.maximize();
}

export async function unmaximizeWindow() {
    return await Neutralino.window.unmaximize();
}

export async function centerWindow() {
    return await Neutralino.window.center();
}

export async function getWindowSize() {
    return await Neutralino.window.getSize();
}

export async function getWindowPosition() {
    return await Neutralino.window.getPosition();
}

export async function setWindowSize() {
    return await Neutralino.window.setSize(...arguments);
}

export async function setDraggableRegion() {
    return await Neutralino.window.setDraggableRegion(...arguments);
}

export function initApp() {
    Neutralino.init();
    Neutralino.events.on('windowClose', () => Neutralino.app.exit(0));
}

export function exitApp(code = 0) {
    Neutralino.app.exit(code);
}
