import { eventually } from '../testUtils.js';

export async function dismissDialog() {
    const dialog = await eventually(() => {
        return document.querySelector('sl-dialog.service-dialog[open]');
    });
    const message = dialog.querySelector('.dialog-message').textContent;
    dialog.querySelector('sl-button').click();
    return message;
}
