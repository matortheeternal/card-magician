export default class AsyncBatcher {
    #items = [];
    #timer = null;
    #chain = Promise.resolve();
    #activeCount = 0;

    constructor(write, options = {}) {
        this.write = write;
        this.delay = options.delay ?? 3000;
        this.maxItems = options.maxItems ?? Infinity;
        this.onError = options.onError ?? console.error;
    }

    add(item) {
        this.#items.push(item);
        if (this.#items.length >= this.maxItems) {
            void this.flush();
            return;
        }
        if (this.#timer === null)
            this.#timer = setTimeout(() => this.flush(), this.delay);
    }

    get pending() {
        return this.#items.length > 0 || this.#activeCount > 0;
    }

    flush() {
        if (this.#timer !== null) {
            clearTimeout(this.#timer);
            this.#timer = null;
        }
        if (!this.#items.length) return this.#chain;

        const items = this.#items;
        this.#items = [];
        this.#activeCount++;
        this.#chain = this.#chain
            .then(() => this.write(items))
            .catch(error => this.onError(error))
            .finally(() => { this.#activeCount--; });
        return this.#chain;
    }
}
