const watchers = [];

function resolvePathsArg(pathsArg) {
    if (!pathsArg) return null;
    const pathStrings = Array.isArray(pathsArg) ? pathsArg : [pathsArg];
    return pathStrings.map(pathString => pathString.split('.'));
}

function makeUnwatch(watcher) {
    return function unwatch() {
        watchers.remove(watcher);
    };
}

/**
 * Registers a watcher that is notified when specific paths on an object are reported
 * as changed via `changed()`. Returns an unwatch() function to remove the watcher from
 * the global registry.
 *
 * Example usage:
 * ```js
 * const person = { name: 'bob', age: 100 }
 * watch(person, 'name', () => console.log(`Bob's name was changed`));
 * person.name = 'Alice';
 * changed(person, 'name');
 * ```
 *
 * @param {object} obj - The object to watch.
 * @param {string|string[]|null} pathsArg - Object paths to observe. Pass null or an
 *        empty string to react to all reported changes.
 * @param {function({paths: string[]|null}): void} callback - Invoked synchronously
 *        when a matching change is reported.
 * @returns {function} A function that removes this watcher.
 */
export function watch(obj, pathsArg, callback) {
    const paths = resolvePathsArg(pathsArg);
    const watcher = { obj, paths, callback };
    watchers.push(watcher);
    return makeUnwatch(watcher);
}

export function deepWatch(obj, pathsArg, callback) {
    const paths = resolvePathsArg(pathsArg);
    const watcher = { obj, paths, deep: true, callback };
    watchers.push(watcher);
    return makeUnwatch(watcher);
}

function arrayEqual(a, b) {
    if (a.length !== b.length) return false;
    return a.every((seg, i) => seg === b[i]);
}

function arrayStartsWith(full, prefix) {
    if (full.length < prefix.length) return false;
    return prefix.every((seg, i) => seg === full[i]);
}

function joinPaths(paths) {
    return paths.map(path => path.join('.'));
}

function getDiff(watcherPaths, changedPaths, deep) {
    if (!changedPaths) return { paths: null };
    if (!watcherPaths) return { paths: joinPaths(changedPaths) };
    const matchedPaths = changedPaths.filter(changedPath => {
        return watcherPaths.some(watcherPath => {
            return arrayEqual(watcherPath, changedPath)
                || (deep && arrayStartsWith(watcherPath, changedPath));
        });
    });
    if (!matchedPaths.length) return null;
    return { paths: joinPaths(matchedPaths) };
}

/**
 * Reports that one or more paths on an object have changed, notifying any registered
 * watchers synchronously in registration order. If no paths are provided, all watchers
 * on the object will be triggered.
 *
 * Example usage:
 * ```js
 * const person = { name: 'bob', age: 100 }
 * watch(person, 'name', () => console.log(`Bob's name was changed`));
 * person.name = 'Alice';
 * changed(person, 'name');
 * ```
 *
 * @param {object} obj - The object that has changed.
 * @param {string|string[]|null} pathsArg - Dot-separated paths that changed. Pass null
 *      or an empty string to indicate the entire object has changed.
 */
window.changed = function changed(obj, pathsArg) {
    const paths = resolvePathsArg(pathsArg);
    watchers.forEach(watcher => {
        if (watcher.obj !== obj) return;
        const diff = getDiff(watcher.paths, paths, watcher.deep);
        if (!diff) return;
        watcher.callback(diff);
    });
};
