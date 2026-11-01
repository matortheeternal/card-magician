import ReactiveComponent from '../ReactiveComponent.js';

const L = localize('face-form');

export default class FaceForm extends ReactiveComponent {
    #face = null;

    connectedCallback() {
        this.setAttribute('data-form-provider', '');
        this.addEventListener('cm-field-changed', event => {
            event.detail.faceId = this.dataset.faceId;
        });
    }

    set face(value) {
        this.#face = value;
        this.render();
    }

    get model() { return this.#face; }
    get face() { return this.#face; }
    get form() { return this.#face.form; }
    get fields() { return this.#face.fields; }
    get subcards() { return this.#face.subcards; }

    getMissingFormHTML() {
        return (
            `<div class="no-content-prompt">
                <span>${L`This face does not have any fields to display.`}</span>
            </div>`
        );
    }

    focusNameField() {
        const firstField = this.querySelector('form-field[field-id="name"]');
        if (!firstField) return;
        const input = firstField.querySelector('sl-input');
        if (!input) return;
        input.scrollIntoView();
        input.focus();
    }

    focusFirstField() {
        const firstField = this.querySelector('form-field');
        if (!firstField) return;
        const input = firstField.querySelector('sl-input, sl-select, sl-textarea');
        if (!input) return;
        input.scrollIntoView(true);
        input.focus();
    }

    getBaseHTML() {
        if (!this.face) return '';
        if (!this.form || !this.fields)
            return this.getMissingFormHTML();
        return '<form-field field-id="template"></form-field>';
    }

    render() {
        this.innerHTML = this.getBaseHTML();
        if (!this.face || !this.form || !this.fields) return;
        this.appendChild(this.form.root);
    }
}

customElements.define('cm-face-form', FaceForm);
