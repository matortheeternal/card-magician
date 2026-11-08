import platform from './platformAdapter.js';

/**
 * @typedef {object} FileWatchError
 * @property {string} message
 * @property {string} [code]
 */

/**
 * @typedef {object} FileWatchEvent
 * @property {'change'|'delete'|'error'} type
 * @property {string} path Absolute path of the watched file.
 * @property {FileWatchError} [error] Present for error events.
 */

/**
 * @callback FileWatchCallback
 * @param {FileWatchEvent} event
 * @returns {void|Promise<void>}
 */

let activeContext = new Set();
const report = (...args) => createReporter({ unit: 'FileWatcher' })(...args);

export function clear() {
    const previous = activeContext;
    activeContext = new Set();
    for (const stop of previous) void stop().catch(error => report('close', error));
}

/**
 * Watch changes, deletion, and recreation after file stats settle for 250ms.
 * The parent directory must exist. Does not emit an initial event.
 * Watches are released by clear(), window reload, or the returned unsubscribe.
 *
 * @param {string} filename
 * @param {FileWatchCallback} callback
 * @returns {Promise<function(): Promise<void>>} Resolves when watching is ready.
 */
export async function watchFile(filename, callback) {
    const context = activeContext;
    const id = crypto.randomUUID();
    let active = true;
    const removeListener = platform.onFileChange(event => {
        if (!active || context !== activeContext || event.id !== id) return;
        const detail = { ...event };
        delete detail.id;
        Promise.resolve().then(() => {
            if (active && context === activeContext) return callback(detail);
        }).catch(error => report('callback', error, [filename]));
    });
    const stop = async () => {
        if (!active) return;
        active = false;
        context.delete(stop);
        removeListener();
        await platform.stopFileWatch(id);
    };
    context.add(stop);
    try {
        await platform.startFileWatch(id, filename);
    } catch (error) {
        active = false;
        context.delete(stop);
        removeListener();
        throw error;
    }
    return stop;
}

/**
 * Read changed text files and apply only reads from the current project context.
 * Missing files retain their last value. Read and watcher errors are reported.
 *
 * @param {string} filename
 * @param {function(string): void} apply
 * @param {object} [options]
 * @param {boolean} [options.initial=false] Read immediately after watching starts.
 * @returns {Promise<function(): Promise<void>>}
 */
export async function watchTextFile(filename, apply, { initial = false } = {}) {
    const context = activeContext;
    let active = true;
    let revision = 0;
    const refresh = async event => {
        const currentRevision = ++revision;
        if (event?.type === 'delete') return;
        if (event?.type === 'error') {
            report('watch', event.error, [filename]);
            return;
        }
        try {
            const source = await platform.readFile(filename);
            if (active && context === activeContext && revision === currentRevision)
                apply(source);
        } catch (error) {
            if (!['ENOENT', 'ENOTDIR'].includes(error.code))
                report('read', error, [filename]);
        }
    };
    const stop = await watchFile(filename, refresh);
    if (initial && context === activeContext) await refresh();
    return async () => {
        active = false;
        await stop();
    };
}
