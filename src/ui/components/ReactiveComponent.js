import { watch } from '../../shared/reactivity.js';

export default class ReactiveComponent extends HTMLElement {
    #watchers = {};
    #eventHandlers = [];

    constructor() {
        super();
        this.watch = this.watch.bind(this);
    }

    disconnectedCallback() {
        for (const watcherId in this.#watchers) this.#watchers[watcherId]?.();
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

    watch(watchId, obj, keysArg, callback) {
        this.#watchers[watchId]?.();
        const unwatch = watch(obj, keysArg, callback);
        this.#watchers[watchId] = unwatch;
        return {
            remove: () => {
                delete this.#watchers[watchId];
                unwatch();
            }
        };
    }
}
