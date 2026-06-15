import ReactiveComponent from '../ReactiveComponent.js';

const L = localize('face-form');

export default class FaceForm extends ReactiveComponent {
    #face = null;

    connectedCallback() {
        this.setAttribute('data-form-provider', '');
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
