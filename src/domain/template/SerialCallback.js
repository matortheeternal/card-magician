function mergeChanges(queued, diff) {
    if (!queued) return diff;
    if (!queued.paths || !diff.paths) return { paths: null };
    return { paths: [...new Set([...queued.paths, ...diff.paths])] };
}

export default class SerialCallback {
    constructor(callback) {
        this.callback = callback;
        this.running = null;
        this.queued = null;
    }

    call(diff) {
        if (this.running) return this.queue(diff);
        const result = this.callback(diff);
        if (!(result instanceof Promise)) return result;
        this.running = result.finally(() => this.runQueued());
        return this.running;
    }

    queue(diff) {
        this.queued = mergeChanges(this.queued, diff);
        return this.running;
    }

    runQueued() {
        this.running = null;
        if (!this.queued) return;
        const diff = this.queued;
        this.queued = null;
        return this.call(diff);
    }
}
