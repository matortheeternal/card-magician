import { watch } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';

async function signature(filename) {
    try {
        const stat = await fs.stat(filename);
        if (!stat.isFile()) return null;
        return `${stat.dev}:${stat.ino}:${stat.size}:${stat.mtimeMs}:${stat.ctimeMs}`;
    } catch (error) {
        if (['ENOENT', 'ENOTDIR'].includes(error.code)) return null;
        throw error;
    }
}

/**
 * Watch a file in an existing directory across replacement saves.
 * Resolves to a close function once watching is ready; emits no initial event.
 */
export async function watchFile(filename, callback, settleMs = 250) {
    let closed = false;
    let timer;
    let revision = 0;
    let previous;
    let observed;
    let ready = false;
    const notifyError = error => callback({
        type: 'error', path: filename,
        error: { message: error.message, code: error.code }
    });
    const schedule = () => {
        if (closed) return;
        revision++;
        clearTimeout(timer);
        timer = setTimeout(check, settleMs);
    };
    const check = async () => {
        const currentRevision = revision;
        try {
            const value = await signature(filename);
            if (closed || currentRevision !== revision) return;
            if (!ready || value !== observed) {
                observed = value;
                schedule();
                return;
            }
            if (value === previous) return;
            previous = value;
            callback({ type: value === null ? 'delete' : 'change', path: filename });
        } catch (error) {
            if (!closed) notifyError(error);
        }
    };
    const normalize = value => process.platform === 'win32'
        ? value.toLowerCase() : value;
    const basename = normalize(path.basename(filename));
    const watcher = watch(path.dirname(filename), (_event, entry) => {
        if (entry === null || normalize(entry.toString()) === basename) schedule();
    });
    watcher.on('error', error => {
        if (!closed) notifyError(error);
    });
    const close = () => {
        closed = true;
        revision++;
        clearTimeout(timer);
        watcher.close();
    };
    try {
        previous = observed = await signature(filename);
        ready = true;
        return close;
    } catch (error) {
        close();
        throw error;
    }
}
