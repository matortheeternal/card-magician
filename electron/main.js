import { app, BrowserWindow, dialog } from 'electron';
import fs from 'node:fs/promises';
import path from 'node:path';
import { root, createEnvironment, getArgument } from './paths.js';
import ContentStore from './ContentStore.js';
import NativeBridge from './NativeBridge.js';
import ResourceServer, { origin, registerResourceScheme } from './ResourceServer.js';
import WindowLifecycle from './WindowLifecycle.js';
import FileOpener from './FileOpener.js';

app.setName('Card Magician');
const environment = createEnvironment();
let mainWindow = null;
let fileOpener = null;
registerResourceScheme();

function createWindow() {
    const window = new BrowserWindow({
        title: 'Card Magician', width: 800, height: 720,
        minWidth: 800, minHeight: 600, backgroundColor: '#202124',
        icon: path.join(root, 'resources/icons/appIcon.png'),
        webPreferences: {
            preload: path.join(root, 'electron/preload.cjs'),
            contextIsolation: true, nodeIntegration: false, sandbox: true
        }
    });
    window.setMenuBarVisibility(false);
    return window;
}

function configureNavigation(window) {
    window.webContents.on('will-navigate', (event, url) => {
        if (!url.startsWith(`${origin}/`)) event.preventDefault();
    });
    window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    window.webContents.on('render-process-gone', (_event, details) => {
        const message = `The renderer exited (${details.reason}). `
            + 'Restart the application to continue.';
        dialog.showErrorBox('Card Magician stopped responding', message);
        app.exit(1);
    });
    window.webContents.on('console-message', event => {
        if (event.level === 'error') console.error('Renderer:', event.message);
    });
}

async function prepareContent() {
    await fs.mkdir(environment.paths.data, { recursive: true });
    if (app.isPackaged) {
        const { content } = environment.paths;
        const store = new ContentStore(root, content, environment.version);
        await store.update();
    }
}

async function start() {
    await prepareContent();
    const resources = new ResourceServer(path.join(root, 'resources'));
    resources.start();
    mainWindow = createWindow();
    fileOpener = new FileOpener(mainWindow);
    const lifecycle = new WindowLifecycle(mainWindow);
    const bridge = new NativeBridge(mainWindow, environment, resources, lifecycle);
    bridge.start();
    configureNavigation(mainWindow);
    await mainWindow.loadURL(`${origin}${getArgument('--url', '/')}`);
    if (process.argv.includes('--devtools'))
        mainWindow.webContents.openDevTools();
    if (process.platform !== 'darwin')
        fileOpener.openFileArgs();
}

app.on('open-file', (event, filePath) => {
    event.preventDefault();
    fileOpener.open(filePath);
});

app.whenReady().then(start).catch(error => {
    console.error(error);
    dialog.showErrorBox('Unable to start Card Magician', error.message);
    app.exit(1);
});
