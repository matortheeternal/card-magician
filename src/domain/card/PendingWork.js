export default class PendingWork {
    #promises = new Set();

    get isIdle() {
        return this.#promises.size === 0;
    }

    track(promise) {
        this.#promises.add(promise);
        promise.finally(() => this.#promises.delete(promise));
    }

    async settled() {
        while (!this.isIdle)
            await Promise.allSettled(this.#promises);
    }
}
