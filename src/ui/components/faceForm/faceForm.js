import { executeAction } from '../../systems/actionSystem.js';
import ReactiveComponent from '../ReactiveComponent.js';

const L = localize('face-form');

export default class FaceForm extends ReactiveComponent {
    #face = null;

    connectedCallback() {
        this.setAttribute('data-form-provider', '');
        this.handleEvents('click', { addFace: this.addFace });
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

    getMissingFaceHTML() {
        const faceId = this.dataset.faceId;
        return (
            `<div class="no-content-prompt">
                <span>${L`This card does not have a ${faceId} face.`}</span>
                <div class="buttons-container">
                    <sl-button
                        class="add-face-btn"
                        size="large"
                        data-click-action="addFace">
                        ${L`Add ${faceId} face`}
                    </sl-button>
                </div>
            </div>`
        );
    }

    getMissingFormHTML() {
        return (
            `<div class="no-content-prompt">
                <span>${L`This face does not have any fields to display.`}</span>
            </div>`
        );
    }

    getBaseHTML() {
        if (!this.face) return this.getMissingFaceHTML();
        if (!this.form || !this.fields)
            return this.getMissingFormHTML();
        return '';
    }

    render() {
        this.innerHTML = this.getBaseHTML();
        if (!this.face || !this.form || !this.fields) return;
        this.appendChild(this.form.root);
    }

    addFace() {
        executeAction('add-face', this.dataset.faceId);
    }
}

customElements.define('cm-face-form', FaceForm);
