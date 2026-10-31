import { app, BrowserWindow, dialog } from 'electron';
import fs from 'node:fs/promises';
import path from 'node:path';
import { root, createEnvironment, getArgument } from './paths.js';
import ContentStore from './ContentStore.js';
import NativeBridge from './NativeBridge.js';
import ResourceServer, { origin, registerResourceScheme } from './ResourceServer.js';
import WindowLifecycle from './WindowLifecycle.js';

app.setName('Card Magician');
const environment = createEnvironment();
registerResourceScheme();

function createWindow() {
    const window = new BrowserWindow({
        title: 'Card Magician', width: 1280, height: 720,
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
    const window = createWindow();
    const lifecycle = new WindowLifecycle(window);
    new NativeBridge(window, environment, resources, lifecycle).start();
    configureNavigation(window);
    await window.loadURL(`${origin}${getArgument('--url', '/')}`);
    if (process.argv.includes('--devtools')) window.webContents.openDevTools();
}

// Awaiting readiness at module scope prevents Electron from completing ESM startup.
app.whenReady().then(start).catch(error => {
    console.error(error);
    dialog.showErrorBox('Unable to start Card Magician', error.message);
    app.exit(1);
});
