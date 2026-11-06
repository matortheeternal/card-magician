import { app, dialog, ipcMain, shell } from 'electron';
import fs from 'node:fs/promises';
import path from 'node:path';
import { watchFile } from './FileWatcher.js';
import { launchSvgEditor } from './launchSvgEditor.js';
import FileSystem from './FileSystem.js';
import Storage from './Storage.js';
import ExtensionRegistry from './ExtensionRegistry.js';
import { origin } from './ResourceServer.js';

export default class NativeBridge {
    constructor(window, environment, resources, lifecycle) {
        Object.assign(this, { window, environment, resources, lifecycle });
        this.files = new FileSystem(environment.paths.content, environment.paths.plugins);
        this.storage = new Storage(environment.paths.data);
        this.registry = new ExtensionRegistry(environment);
        this.operations = this.createOperations();
        this.fileWatchers = new Map();
        window.webContents.on('did-start-navigation', (_event, _url, inPlace, main) => {
            if (main && !inPlace) this.closeFileWatchers();
        });
        window.webContents.on('render-process-gone', () => this.closeFileWatchers());
        window.on('closed', () => this.closeFileWatchers());
    }

    trusted(event, bootstrap = false) {
        if (event.sender !== this.window.webContents
            || event.senderFrame !== event.sender.mainFrame) return false;
        // Preload metadata is requested before the document URL is committed.
        return bootstrap || event.senderFrame.url.startsWith(`${origin}/`);
    }

    start() {
        ipcMain.on('card-magician:metadata', event => {
            event.returnValue = this.trusted(event, true) ? this.environment : null;
        });
        ipcMain.handle('card-magician:native', (event, operation, args) => {
            return this.handle(event, operation, args);
        });
    }

    async handle(event, operation, args) {
        const valid = this.trusted(event) && Object.hasOwn(this.operations, operation)
            && Array.isArray(args);
        if (!valid) {
            return { error: {
                message: 'Invalid native request', code: 'ACCESS_DENIED'
            } };
        }
        try {
            return { value: await this.operations[operation](...args) };
        } catch (error) {
            return { error: { message: error.message, code: error.code } };
        }
    }

    createOperations() {
        const operations = {};
        const fileOperations = [
            'readDirectory', 'readFile', 'writeFile', 'readBinaryFile', 'writeBinaryFile',
            'getStats', 'getAbsolutePath', 'getJoinedPath', 'getPathParts',
            'checkFileExists', 'checkFolderExists',
            'moveFile', 'copyFile', 'createDirectory', 'rmrf'
        ];
        for (const name of fileOperations)
            operations[name] = this.files[name].bind(this.files);
        Object.assign(operations, this.dialogOperations(), {
            registryRequest: (endpoint, etag) => this.registry.request(endpoint, etag),
            getInstalledExtensions: () => this.registry.installed(),
            installRegistryExtension: (id, type, version) =>
                this.registry.install(id, type, version),
            uninstallRegistryExtension: (id, type) => this.registry.uninstall(id, type),
            debugLog: line => this.appendLog(line),
            getStoredData: key => this.storage.get(key),
            storeData: (key, value) => this.storage.set(key, value),
            clearStoredData: () => this.storage.clear(),
            openUrl: url => this.openUrl(url),
            open: filename => this.openPath(filename),
            openSvgEditor: (executable, filename) => {
                return launchSvgEditor(executable, this.files.absolute(filename));
            },
            watchFile: (id, filename) => this.watchFile(id, filename),
            unwatchFile: id => this.unwatchFile(id),
            getMounts: () => this.resources.getMounts(),
            mount: (url, target) => {
                this.resources.mount(url, this.files.absolute(target));
            },
            unmount: url => this.resources.unmount(url),
            writeProcessOutput: data => { process.stdout.write(data); },
            writeProcessError: data => { process.stderr.write(data); },
            readyToClose: () => this.lifecycle.readyToClose(),
            terminateApp: code => this.lifecycle.exit(code)
        });
        this.addTestOperations(operations);
        return operations;
    }

    async watchFile(id, filename) {
        if (typeof id !== 'string' || !id || this.fileWatchers.has(id))
            throw new TypeError('A unique file watch ID is required.');
        const entry = {};
        this.fileWatchers.set(id, entry);
        try {
            const close = await watchFile(this.files.absolute(filename), event => {
                if (this.fileWatchers.get(id) !== entry) return;
                if (!this.window.webContents.isDestroyed()) {
                    this.window.webContents.send(
                        'card-magician:file-watch', { id, ...event }
                    );
                }
            });
            if (this.fileWatchers.get(id) === entry) entry.close = close;
            else close();
        } catch (error) {
            if (this.fileWatchers.get(id) === entry) this.fileWatchers.delete(id);
            throw error;
        }
    }

    unwatchFile(id) {
        this.fileWatchers.get(id)?.close?.();
        this.fileWatchers.delete(id);
    }

    closeFileWatchers() {
        for (const id of this.fileWatchers.keys()) this.unwatchFile(id);
    }

    dialogOperations() {
        return {
            openSingleFileDialog: (title, filters) => this.openDialog({
                title, filters, properties: ['openFile']
            }),
            openFolderDialog: title => this.openDialog({
                title, properties: ['openDirectory']
            }),
            saveSingleFileDialog: (title, defaultPath, filters) => {
                return this.saveDialog({ title, defaultPath, filters });
            }
        };
    }

    async openDialog(options) {
        const result = await dialog.showOpenDialog(this.window, options);
        return result.canceled ? undefined : result.filePaths[0];
    }

    async saveDialog(options) {
        const result = await dialog.showSaveDialog(this.window, options);
        return result.canceled ? undefined : result.filePath;
    }

    appendLog(line) {
        return fs.appendFile(path.join(this.environment.paths.data, 'app.log'), line);
    }

    async openUrl(url) {
        if (!['https:', 'http:'].includes(new URL(url).protocol))
            throw new Error('Only HTTP and HTTPS URLs can be opened externally');
        await shell.openExternal(url);
    }

    async openPath(filename) {
        const error = await shell.openPath(this.files.absolute(filename));
        if (error) throw new Error(error);
    }

    addTestOperations(operations) {
        const { id, args } = this.environment;
        const exitTest = id.startsWith('cardmagician.exit.')
            && args.includes('--test-exit');
        if (!exitTest) return;
        operations.testWindowClose = () => { setImmediate(() => this.window.close()); };
        operations.testAppQuit = () => { setImmediate(() => app.quit()); };
    }
}
