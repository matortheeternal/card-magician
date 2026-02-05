import Modal from '../Modal.js';
import { closeModal, registerModal } from '../modalManager.js';
import { registerProgressEndpoint } from '../../systems/progressSystem.js';

export default class ProgressModal extends Modal {
    static id = 'cm-progress-modal';
    title = 'Progress';
    canClose = false;

    #unregister = null;
    #data = {};
    #statusMessage = '';
    #operationMessage = ' ';
    #progress = 0;
    #maxProgress = 1;

    connectedCallback() {
        super.connectedCallback();
        this.start = performance.now();
        this.#unregister = registerProgressEndpoint({
            setStatus: value => this.statusMessage = value,
            setOperation: value => this.operationMessage = value,
            setMax: value => this.maxProgress = value,
            incrementProgress: (value = 1) => this.progress += value,
            setTitle: value => this.setTitle(value),
            complete: () => this.done(),
            onError: error => this.onError(error)
        });
    }

    disconnectedCallback() {
        this.#unregister?.();
    }

    get onClickHandlers() {
        return {
            ...super.onClickHandlers,
            cancel: () => this.cancel()
        };
    }

    get data() {
        return this.#data;
    }

    set data(newValue) {
        this.#data = newValue;
        this.setTitle(newValue.title);
    }

    get statusMessage() {
        return this.#statusMessage;
    }

    set statusMessage(statusMessage) {
        this.#statusMessage = statusMessage;
        this.operationMessage = ' ';
        this.querySelector('.status-message').textContent = statusMessage;
    }

    get operationMessage() {
        return this.#operationMessage;
    }

    set operationMessage(operationMessage) {
        this.#operationMessage = operationMessage;
        this.querySelector('.operation-message').textContent = operationMessage;
    }

    set maxProgress(maxProgress) {
        this.#maxProgress = maxProgress;
    }

    get progress() {
        return this.#progress;
    }

    get progressPercent() {
        return 100 * this.#progress / this.#maxProgress;
    }

    get progressBarLabel() {
        return this.progressPercent.toFixed(1) + '%';
    }

    set progress(progress) {
        this.#progress = progress;
        this.querySelector('sl-progress-bar').value = this.progressPercent.toFixed(0);
        this.querySelector('sl-progress-bar').textContent = this.progressBarLabel;
    }

    get timeElapsed() {
        const diff = performance.now() - this.start;
        return `${(diff / 1000).toFixed(2)}s`;
    }

    setTitle(newTitle) {
        this.title = newTitle;
        const titleDiv = this.querySelector('.modal-title-bar > .title');
        if (titleDiv) titleDiv.textContent = newTitle;
    }

    allowClose() {
        this.canClose = true;
        this.render();
    }

    close() {
        if (!this.canClose) return;
        super.close();
    }

    onError(error) {
        this.allowClose();
        this.statusMessage = 'Error';
        this.operationMessage = error.message;
        this.classList.add('error');
    }

    done() {
        this.progress = this.#maxProgress;
        this.statusMessage = 'Done.';
        this.operationMessage = `Completed in ${this.timeElapsed}`;
        this.classList.add('done');
        this.allowClose();
        if (this.data?.autoclose) closeModal();
    }

    async cancel() {
        log('user').info(`User cancelled ${this.title}`);
        this.setTitle('Cancelling...');
        await this.data?.cancelCallback?.();
        this.allowClose();
    }

    renderBody() {
        return (
            `<div class="status-message">${this.statusMessage}</div>
             <sl-progress-bar
                value="${this.progressPercent.toFixed(0)}"
             >${this.progressBarLabel}</sl-progress-bar>
             <div class="operation-message">${this.operationMessage}</div>`
        );
    }

    renderActions() {
        return this.canClose ? (
            `<sl-button data-click-action="close">Close</sl-button>`
        ) : (
            `<sl-button
                data-click-action="cancel"
                ${this.data?.cancelCallback ? '' : 'disabled'}
             >Cancel</sl-button>`
        );
    }
}

registerModal(ProgressModal);
