import ComponentWithFields from '../systems/componentWithFields.js';
import { closeModal } from './modalManager.js';
import { renderFields } from '../systems/fieldSystem.js';
import ReactiveComponent from '../ReactiveComponent.js';

export default class Modal extends ReactiveComponent {
    static id = 'base-modal';
    title = '';
    #data = {};

    get onClickHandlers() {
        return { close: this.close };
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

    connectedCallback() {
        this.bind();
        this.render();
    }

    bind() {
        this.handleEvents('click', this.onClickHandlers);
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

    renderFields() {
        renderFields(this, this.data, this.fields);
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
                ${(actionsHTML && (
                    `<div class="modal-actions">${actionsHTML}</div>`
                )) || ''}
            </div>`
        );
        this.afterRender();
    }

    afterRender() {
        this.renderFields();
    }

    renderFields(model = this.data) {
        renderFields(this, model, this.fields, this);
    }
}
