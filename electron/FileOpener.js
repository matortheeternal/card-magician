import { ipcMain } from 'electron';
import path from 'node:path';

const SUPPPORTED_EXTENSIONS = ['.cmproj', '.cmpkg'];

export default class FileOpener {
    rendererReady = false;
    pendingFiles = [];

    constructor(mainWindow) {
        this.mainWindow = mainWindow;
        ipcMain.on('renderer-ready', () => this.flush());
    }

    get ready() {
        return this.rendererReady
            && !this.mainWindow.isDestroyed();
    }

    showAndFocusWindow() {
        if (!this.ready()) return;
        if (this.mainWindow.isMinimized()) this.mainWindow.restore();
        this.mainWindow.show();
        this.mainWindow.focus();
    }

    open(filePath) {
        if (!this.ready) {
            this.pendingFiles.push(filePath);
            return;
        }

        this.mainWindow.webContents.send('open-file', filePath);
        this.showAndFocusWindow();
    }

    getFilePathsFromArgs(argv, workingDir) {
        return argv
            .filter(arg => !arg.startsWith('-'))
            .map(arg => path.resolve(workingDir, arg))
            .filter(file => {
                const ext = path.extname(file).toLowerCase();
                return SUPPPORTED_EXTENSIONS.includes(ext);
            });
    }

    openFileArgs(
        argv = process.argv.slice(1),
        workingDir = process.cwd()
    ) {
        const filePaths = this.getFilePathsFromArgs(argv, workingDir);
        for (const filePath of filePaths) this.open(filePath);
    }

    flush() {
        this.rendererReady = true;
        for (const filePath of this.pendingFiles.splice(0))
            this.open(filePath);
    }
}
