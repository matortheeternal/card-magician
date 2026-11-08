import { app } from 'electron';

export default class WindowLifecycle {
    ready = false;
    requested = false;
    exiting = false;

    constructor(window) {
        this.window = window;
        window.on('close', event => this.onClose(event));
        app.on('before-quit', event => this.onClose(event));
    }

    onClose(event) {
        if (this.exiting) return;
        event.preventDefault();
        this.requested = true;
        if (this.ready && !this.window.isDestroyed())
            this.deliverRequest();
    }

    readyToClose() {
        this.ready = true;
        if (this.requested) this.deliverRequest();
    }

    deliverRequest() {
        this.requested = false;
        this.window.webContents.send('card-magician:close');
    }

    exit(code = 0) {
        if (!Number.isInteger(code)) throw new TypeError('Exit code must be an integer.');
        this.exiting = true;
        // Acknowledge the renderer's IPC request before tearing it down.
        setImmediate(() => app.exit(code));
    }
}
