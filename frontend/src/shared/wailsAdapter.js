import {
    WindowMinimise, WindowMaximise, WindowUnmaximise,
    WindowCenter, WindowGetSize, WindowGetPosition,
    WindowSetSize, BrowserOpenURL, Quit
} from '../../wailsjs/runtime';
import {
    CreateDirectory, GetStats, GetConfig,
    ReadDirectory, ReadBinaryFile, WriteBinaryFile,
    ReadFile, WriteFile, GetAbsolutePath,
    OpenFileDialog, SaveFileDialog,
    GetAppDir, GetDataDir
} from '../../wailsjs/go/main/App';

export async function openSingleFileDialog(title, filters) {
    const res = await OpenFileDialog(title, filters);
    return res || null;
}

export async function saveSingleFileDialog(title, defaultPath, filters) {
    return await SaveFileDialog(title, defaultPath, filters);
}

export async function getStoredData(key) {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
}

export async function storeData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

export async function readFile(path) {
    return await ReadFile(path);
}

export async function writeFile(path, data) {
    return await WriteFile(path, data);
}

export async function readBinaryFile(path) {
    return await ReadBinaryFile(path);
}

export async function writeBinaryFile(path, data) {
    return await WriteBinaryFile(path, data);
}

export async function readDirectory(path) {
    return await ReadDirectory(path);
}

export async function getStats(path) {
    return await GetStats(path);
}

export async function createDirectory(path) {
    return await CreateDirectory(path);
}

export async function getAbsolutePath(path) {
    return await GetAbsolutePath(path);
}

export async function open(path) {
    BrowserOpenURL(path);
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
    const config = await GetConfig();
    return config.RunTests;
}

export async function shouldLocalize() {
    const config = await GetConfig();
    return config.Localize;
}

export async function getAppDir() {
    return GetAppDir();
}

export async function getDataDir() {
    return GetDataDir();
}

export function exitApp() {
    Quit();
}
