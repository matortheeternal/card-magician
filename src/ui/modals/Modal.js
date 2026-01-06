import { closeModal } from './modalManager.js';
import ReactiveComponent from '../components/ReactiveComponent.js';

export default class Modal extends ReactiveComponent {
    static id = 'base-modal';
    title = '';
    #data = {};

    connectedCallback() {
        this.setAttribute('data-form-provider', '');
        this.render();
        this.bind();
    }

    bind() {
        this.handleEvents('click', this.onClickHandlers);
    }

    get onClickHandlers() {
        return { close: this.close };
    }

    get model() {
        return this.#data;
    }

    get data() {
        return this.#data;
    }

    set data(newData) {
        this.#data = newData;
    }

    get fields() {
        return [];
    }

    close() {
        closeModal();
    }

    renderBody() {
        return '';
    }

    renderActions() {
        return null;
    }

    render() {
        const actionsHTML = this.renderActions();
        this.innerHTML = (
            `<div class="modal">
                <div class="modal-title-bar">
                    <div>${this.title}</div>
                    <div class="close-modal">
                        <sl-icon name="x-lg" data-click-action="close"></sl-icon>
                    </div>
                </div>
                <div class="modal-body">${this.renderBody()}</div>
                ${actionsHTML ? `<div class="modal-actions">${actionsHTML}</div>` : ''}
            </div>`
        );
    }
}
