export default class ReactiveComponent extends HTMLElement {
    #cleanup = [];
    #eventHandlers = [];

    constructor() {
        super();
        this.effect = this.effect.bind(this);
    }

    disconnectedCallback() {
        for (const cleanup of this.#cleanup) cleanup();
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
}
