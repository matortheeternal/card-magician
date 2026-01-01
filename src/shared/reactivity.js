const watchers = [];

function resolvePathsArg(pathsArg) {
    if (!pathsArg) return null;
    const pathStrings = Array.isArray(pathsArg) ? pathsArg : [pathsArg];
    return pathStrings.map(pathString => pathString.split('.'));
}

function makeUnwatch(watcher) {
    return function unwatch() {
        const index = watchers.indexOf(watcher);
        if (index > -1) watchers.splice(index, 1);
    };
}

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

export function changed(obj, pathsArg) {
    const paths = resolvePathsArg(pathsArg);
    watchers.forEach(watcher => {
        if (watcher.obj !== obj) return;
        const diff = getDiff(watcher.paths, paths, watcher.deep);
        if (!diff) return;
        watcher.callback(diff);
    });
}

window.changed = changed;
