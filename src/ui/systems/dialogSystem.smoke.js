import { dialogSystem } from './dialogSystem.js';

describe('Dialogs', () => {
    beforeEach(() => {
        const animate = Element.prototype.animate;
        // The app and smoke tests use separate bundles, so overriding a bundled
        // Shoelace animation registry would not affect the app's components.
        // Keep native finish events, but remove animation durations and delays.
        spyOn(Element.prototype, 'animate').and.callFake(function(keyframes, options) {
            return animate.call(this, keyframes, {
                ...options, duration: 0, delay: 0, endDelay: 0,
            });
        });
    });

    async function shownDialog() {
        await Promise.resolve();
        const dialog = document.querySelector('sl-dialog.service-dialog');
        // Initial focus runs in a separate animation frame. With animations
        // disabled, sl-after-show can arrive before that focus callback.
        await Promise.all(['sl-after-show', 'sl-initial-focus'].map(eventName =>
            new Promise(resolve => {
                dialog.addEventListener(eventName, resolve, { once: true });
            })
        ));
        return dialog;
    }

    it('exposes the shared service globally', () => {
        expect(window.dialog).toBe(dialogSystem);
    });

    it('renders plain text and resolves an alert after dismissal', async () => {
        let settled = false;
        const result = dialogSystem.alert('<b>Message</b>\nSecond line');
        result.then(() => { settled = true; });
        const dialog = await shownDialog();
        expect(dialog.querySelector('.dialog-message').textContent)
            .toBe('<b>Message</b>\nSecond line');
        expect(dialog.querySelector('b')).toBeNull();
        expect(dialog.querySelectorAll('sl-button').length).toBe(1);
        expect(settled).toBeFalse();
        dialog.querySelector('sl-button').click();
        expect(await result).toBeUndefined();
        expect(dialog.isConnected).toBeFalse();
        expect(dialogSystem.isOpen).toBeFalse();
    });

    it('resolves true when the confirm button is clicked', async () => {
        const result = dialogSystem.confirm('Continue?');
        const dialog = await shownDialog();
        dialog.querySelector('sl-button[variant="primary"]').click();
        expect(await result).toBeTrue();
    });

    it('resolves false when cancelled or dismissed', async () => {
        const cancelled = dialogSystem.confirm('Continue?');
        const first = await shownDialog();
        first.querySelector('sl-button').click();
        expect(await cancelled).toBeFalse();

        const dismissed = dialogSystem.confirm('Continue?');
        const second = await shownDialog();
        second.hide();
        expect(await dismissed).toBeFalse();
    });

    it('returns prompt text on acceptance, including an empty string', async () => {
        for (const value of ['New tag', '']) {
            const result = dialogSystem.prompt('Tag name', { defaultValue: 'Old tag' });
            const dialog = await shownDialog();
            const input = dialog.querySelector('sl-input');
            expect(input.value).toBe('Old tag');
            expect(document.activeElement).toBe(input);
            input.value = value;
            dialog.querySelector('sl-button[variant="primary"]').click();
            expect(await result).toBe(value);
        }
    });

    it('accepts prompt text with Enter and returns null on cancellation', async () => {
        const accepted = dialogSystem.prompt('Tag name');
        const first = await shownDialog();
        const input = first.querySelector('sl-input');
        input.value = 'Entered tag';
        input.dispatchEvent(new KeyboardEvent('keydown', {
            key: 'Enter', bubbles: true, cancelable: true,
        }));
        expect(await accepted).toBe('Entered tag');

        const cancelled = dialogSystem.prompt('Tag name');
        const second = await shownDialog();
        second.querySelector('sl-button').click();
        expect(await cancelled).toBeNull();

        const dismissed = dialogSystem.prompt('Tag name');
        const third = await shownDialog();
        third.hide();
        expect(await dismissed).toBeNull();
    });

    it('ignores overlay clicks for alerts, confirmations, and prompts', async () => {
        for (const method of ['alert', 'confirm', 'prompt']) {
            const result = dialogSystem[method]('Important interaction');
            const dialog = await shownDialog();
            let closeRequest;
            dialog.addEventListener('sl-request-close', event => {
                closeRequest = event;
            });
            dialog.shadowRoot.querySelector('[part="overlay"]').click();
            expect(closeRequest.detail.source).toBe('overlay');
            expect(closeRequest.defaultPrevented).toBeTrue();
            expect(dialog.open).toBeTrue();
            await dialog.hide();
            await result;
        }
    });

    it('queues concurrent requests without removing the existing modal', async () => {
        const modal = document.createElement('div');
        modal.className = 'modal-container';
        document.body.append(modal);
        try {
            const first = dialogSystem.confirm('First');
            const second = dialogSystem.confirm('Second');
            const firstDialog = await shownDialog();
            expect(document.querySelectorAll('.service-dialog').length).toBe(1);
            expect(firstDialog.parentElement).toBe(document.body);
            expect(modal.isConnected).toBeTrue();
            firstDialog.hide();
            await first;
            const secondDialog = await shownDialog();
            expect(secondDialog.querySelector('.dialog-message').textContent)
                .toBe('Second');
            secondDialog.hide();
            expect(await second).toBeFalse();
        } finally {
            modal.remove();
        }
    });
});
