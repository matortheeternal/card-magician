/** Flushes registered persistence work before terminating the application. */
export default class ExitManager {
    #callbacks = [];
    #flushing = null;
    #exiting = null;
    #closing = false;

    constructor(exit, onError, onStart = () => {}) {
        this.exitNative = exit;
        this.onError = onError;
        this.onStart = onStart;
    }

    /** Register a flush callback and a synchronous pending-work predicate. */
    beforeExit(callback, hasPending = () => true) {
        const entry = { callback, hasPending };
        this.#callbacks.push(entry);
        return () => {
            this.#callbacks = this.#callbacks.filter(value => value !== entry);
        };
    }

    get closing() {
        return this.#closing;
    }

    get pending() {
        return !!this.#exiting || this.#callbacks.some(entry => entry.hasPending());
    }

    flush() {
        if (this.#flushing) return this.#flushing;
        this.#flushing = Promise.allSettled(this.#callbacks.map(entry => {
            return Promise.resolve().then(() => entry.callback());
        })).then(results => {
            const failure = results.find(result => result.status === 'rejected');
            if (failure) throw failure.reason;
        }).finally(() => { this.#flushing = null; });
        return this.#flushing;
    }

    exit(code = 0) {
        if (this.#exiting) return this.#exiting;
        this.#exiting = Promise.resolve().then(() => this.onStart())
            .then(() => this.flush()).then(() => {
                this.#closing = true;
                return this.exitNative(code);
            }).catch(error => {
                this.#closing = false;
                this.#exiting = null;
                this.onError(error);
                throw error;
            });
        return this.#exiting;
    }

}
