import {
    // OpenFileDialog,
    // SaveFileDialog,
    // Open,
    WindowMinimise,
    WindowMaximise,
    WindowUnmaximise,
    WindowCenter,
    WindowGetSize,
    WindowGetPosition,
    WindowSetSize,
    Quit
} from '../../wailsjs/runtime';

export async function openSingleFileDialog(title, filters) {
    // const res = await OpenFileDialog({
    //     title,
    //     filters,
    //     canChooseFiles: true,
    //     canChooseDirectories: false,
    //     allowsMultipleSelection: false,
    // });
    // return res || null;
}

export async function saveSingleFileDialog(title, defaultPath, filters) {
    // return await SaveFileDialog({
    //     title,
    //     defaultFilename: defaultPath,
    //     filters,
    // });
}

export async function getStoredData(key) {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
}

export async function storeData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

export async function readFile(path) {
    return await window.backend.App.ReadFile(path);
}

export async function writeFile(path, data) {
    return await window.backend.App.WriteFile(path, data);
}

export async function readBinaryFile(path) {
    return await window.backend.App.ReadBinaryFile(path);
}

export async function writeBinaryFile(path, data) {
    return await window.backend.App.WriteBinaryFile(path, data);
}

export async function readDirectory(path) {
    return await window.backend.App.ReadDirectory(path);
}

export async function getStats(path) {
    return await window.backend.App.GetStats(path);
}

export async function createDirectory(path) {
    return await window.backend.App.CreateDirectory(path);
}

export async function getAbsolutePath(path) {
    return await window.backend.App.GetAbsolutePath(path);
}

export async function open(path) {
    // return await Open(path);
}

export async function minimizeWindow() {
    return WindowMinimise();
}

export async function maximizeWindow() {
    return WindowMaximise();
}

export async function unmaximizeWindow() {
    return WindowUnmaximise();
}

export async function centerWindow() {
    return WindowCenter();
}

export async function getWindowSize() {
    return WindowGetSize();
}

export async function getWindowPosition() {
    return WindowGetPosition();
}

export async function setWindowSize(options) {
    return WindowSetSize(options);
}

export async function shouldRunTests() {
    const config = await window.backend.App.GetConfig();
    return config.RunTests;
}

export async function shouldLocalize() {
    const config = await window.backend.App.GetConfig();
    return config.Localize;
}

export async function getAppDir() {
    return '.';
}

export async function getDataDir() {
    return '';
}

export function exitApp() {
    Quit();
}
