import { watch } from '../../shared/reactivity.js';
import { morphHTML } from '../../domain/template/morphHTML.js';

const REMOVE_DELAY = 500;
const statusContainer = document.querySelector('.status-container');
const statusMessages = [];

class StatusMessage {
    constructor(text, lifetime) {
        this.text = text;
        this.timeout = lifetime > 0
            ? setTimeout(() => this.remove(), lifetime * 1000)
            : null;
    }

    remove() {
        this.removing = true;
        changed(statusMessages);
        setTimeout(() => statusMessages.remove(this), REMOVE_DELAY);
    }
}

export function addStatusMessage(text, lifetime = 5) {
    const message = new StatusMessage(text, lifetime);
    statusMessages.push(message);
    changed(statusMessages);
    return message;
}

watch(statusMessages, '', () => {
    morphHTML(statusContainer, statusMessages.map(msg =>
        `<div class="status-message ${msg.removing ? 'removing' : ''}">
            ${msg.text}
        </div>`
    ));
});
