import { closeModal } from './modalManager.js';
import ReactiveComponent from '../components/ReactiveComponent.js';

export default class Modal extends ReactiveComponent {
    static id = 'base-modal';
    title = '';
    #data = {};

    connectedCallback() {
        log('render').debug(`Component ${this.constructor.id} connected`);
        this.setAttribute('data-form-provider', '');
        this.render();
        this.bind();
    }

    bind() {
        this.handleEvents('click', this.onClickHandlers);
    }

    get onClickHandlers() {
        return {
            close: () => {
                log('user').info(`User closed modal ${this.constructor.id}`);
                this.close();
            }
        };
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
        const start = new Date();
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
                ${actionsHTML && `<div class="modal-actions">${actionsHTML}</div>`}
            </div>`
        );
        log('render').debug(`Rendered ${this.constructor.id} in ${new Date() - start}ms`);
    }
}

window.Modal = Modal;
