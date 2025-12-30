const watchers = [];

function resolveWatchTargets(arg) {
    const res = arg instanceof Function ? arg() : arg;
    return new Set(Array.isArray(res) ? res : [res]);
}

function collect(value, results) {
    if (value === null || value === undefined) return;
    if (typeof value !== 'object') return;
    if (results.has(value)) return;

    results.add(value);
    for (const entry of Object.values(value))
        collect(entry, results);
}

/**
 * Recursively resolves object and array entries, returning a set of every unique
 * reference found to object, array, map, set, and other similar data structures.
 * Skips circular references.
 *
 * @param {Set|Array} targets
 * @returns {Set}
 */
function resolveDeepWatchTargets(targets) {
    const results = new Set();
    for (const target of Object.values(targets))
        collect(target, results);
    return results;
}

function makeUnwatch(watcher) {
    return function unwatch() {
        const index = watchers.indexOf(watcher);
        watchers.splice(index, 1);
    }
}

export function watch(arg, callback) {
    const targets = resolveWatchTargets(arg);
    const watcher = { targets, callback };
    watchers.push(watcher);
    return makeUnwatch(watcher);
}

export function deepWatch(arg, callback) {
    const targets = resolveWatchTargets(arg);
    const deepTargets = resolveDeepWatchTargets(targets);
    const watcher = { targets: deepTargets, deep: true, callback };
    watchers.push(watcher);
    return makeUnwatch(watcher);
}

export function runWatchers(...args) {
    watchers.forEach(watcher => {
        const intersection = watcher.targets.intersection(args);
        if (!intersection.length) return;
        watcher.callback(intersection);
        if (watcher.deep)
            watcher.targets = resolveDeepWatchTargets(watcher.targets);
    });
}
