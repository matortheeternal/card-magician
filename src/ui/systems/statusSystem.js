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
        setTimeout(() => statusMessages.remove(this), REMOVE_DELAY);
    }
}

const statusMessages = [];

export function addStatusMessage(text, lifetime = 5) {
    const message = new StatusMessage(text, lifetime);
    statusMessages.push(message);
    return message;
}
