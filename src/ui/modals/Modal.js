import { closeModal } from './modalManager.js';
import { hydrateFields, renderFields } from '../systems/fieldSystem.js';

export default class Modal extends HTMLElement {
    static id = 'base-modal';
    title = '';
    #data = {};

    get onClick() {
        return { close: this.close };
    }

    get data() {
        return this.#data;
    }

    set data(newData) {
        this.#data = newData;
        // this.render();
    }

    get fields() {
        return [];
    }

    connectedCallback() {
        this.bind();
        this.render();
    }

    bind() {
        this.handleEvents('click', this.onClick);
    }

    getField(subcardId, fieldId) {
        const field = this.fields.find(field => field.id === fieldId);
        if (!field)
            throw new Error('Failed to resolve field: ' + fieldId);
        return field;
    }

    getModel() {
        return this.data;
    }

    close() {
        closeModal();
    }

    handleEvents(eventName, handlers) {
        this.addEventListener(eventName, event => {
            const dataKey = `${eventName}Action`;
            const actionKey = event.target.dataset?.[dataKey];
            const action = handlers[actionKey];
            if (action) action.call(this, event);
        });
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
                ${actionsHTML && (
                    `<div class="modal-actions">${actionsHTML}</div>`
                )}
            </div>`
        );
        renderFields(this, this.data, this.fields);
        hydrateFields(this);
    }
}
