const REMOVE_DELAY = 500;

class StatusMessage {
    constructor(text, lifetime) {
        this.text = text;
        this.timeout = lifetime > 0
            ? setTimeout(() => this.remove(), lifetime * 1000)
            : null;
    }

    remove() {
        this.removing = true;
        setTimeout(() => Alpine.store('statusMessages').remove(this), REMOVE_DELAY);
    }
}

export function addStatusMessage(text, lifetime = 5) {
    const message = Alpine.reactive(new StatusMessage(text, lifetime));
    Alpine.store('statusMessages').push(message);
    return message;
}

export function bindToAlpine() {
    Alpine.store('statusMessages', Alpine.reactive([]));
}
