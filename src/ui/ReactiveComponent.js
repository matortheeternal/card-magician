import { watch } from '../shared/reactivity.js';

export default class ReactiveComponent extends HTMLElement {
    #watchers = [];
    #cleanup = [];
    #eventHandlers = [];

    constructor() {
        super();
        this.effect = this.effect.bind(this);
    }

    disconnectedCallback() {
        for (const cleanup of this.#cleanup) cleanup();
        for (const unwatch of this.#watchers) unwatch();
        for (const { eventName, callback } of this.#eventHandlers)
            this.removeEventListener(eventName, callback);
    }

    on(eventName, callback) {
        this.addEventListener(eventName, callback);
        this.#eventHandlers.push({ eventName, callback });
    }

    handleEvents(eventName, handlers) {
        this.addEventListener(eventName, event => {
            const dataKey = `${eventName}Action`;
            const actionKey = event.target.dataset?.[dataKey];
            const action = handlers[actionKey];
            if (action) action.call(this, event);
        });
    }

    effect(callback) {
        this.#cleanup.push(Alpine.effect(callback));
    }

    watch(obj, keysArg, callback) {
        const unwatch = watch(obj, keysArg, callback);
        this.#watchers.push(unwatch);
        return {
            remove() {
                const index = this.#watchers.indexOf(unwatch);
                if (index > -1) this.#watchers.splice(index, 1);
                unwatch();
            }
        }
    }
}
