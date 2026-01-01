import { emit } from '../../../shared/htmlUtils.js';
import { executeAction } from '../../systems/actionSystem.js';
import { handleFormGroup, renderFields } from '../../systems/fieldSystem.js';
import ReactiveComponent from '../../components/ReactiveComponent.js';

const L = localize('face-form');

export default class FaceForm extends ReactiveComponent {
    #face = null;

    constructor() {
        super();
        this.onButtonClick = this.onButtonClick.bind(this);
    }

    connectedCallback() {
        this.addEventListener('click', this.onButtonClick);
    }

    disconnectedCallback() {
        this.removeEventListener('click', this.onButtonClick);
    }

    getMissingFaceHTML() {
        const faceId = this.dataset.faceId;
        return (
            `<div class="no-content-prompt">
                <span>${L`This card does not have a ${faceId} face.`}</span>
                <div class="buttons-container">
                    <sl-button class="add-face-btn" size="large">
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

    handleGroups() {
        if (!this.form) return;
        const formGroups = this.form.root.querySelectorAll('form-group');
        formGroups.forEach(formGroup => {
            handleFormGroup(formGroup, this.face, this.watch);
        });
    }

    resolveFields(obj) {
        return obj.fields;
    }

    render() {
        this.innerHTML = this.getBaseHTML();
        if (!this.face || !this.form || !this.fields) return;
        renderFields(this.form.root, this.face, this.fields, {
            watch: this.watch
        });
        this.subcards.forEach(subcard => {
            const subcardFields = this.resolveFields(subcard);
            const getSelector = field =>
                `form-field[field-id="${field.id}"][subcard-id="${subcard.id}"]`;
            renderFields(this.form.root, subcard, subcardFields, {
                getSelector,
                watch: this.watch
            });
        });
        this.handleGroups();
        this.appendChild(this.form.root);
    }

    set face(value) {
        this.#face = value;
        this.render();
    }

    get face() { return this.#face; }
    get form() { return this.#face.form; }
    get fields() { return this.#face.fields; }
    get subcards() { return this.#face.subcards; }

    getField(subcardId, fieldId) {
        const target = subcardId
            ? this.subcards.find(s => s.id === subcardId)
            : this.face;
        return target.fields.find(field => field.id === fieldId);
    }

    withFieldId(btn, callback) {
        const fieldElement = btn.closest('form-field');
        const subcardId = fieldElement?.getAttribute('subcard-id');
        const fieldId = fieldElement?.getAttribute('field-id');
        if (!fieldId) return false;
        callback(subcardId, fieldId);
        return true;
    }

    withGroupShowKey(btn, callback) {
        const groupElement = btn.closest('form-group');
        const subcardId = groupElement?.getAttribute('subcard-id');
        const showKey = groupElement?.getAttribute('show');
        if (!showKey) return false;
        callback(subcardId, showKey);
        return true;
    }

    addField(btn) {
        return this.withFieldId(btn, (subcardId, fieldId) => {
            const field = this.getField(subcardId, fieldId);
            this.face[fieldId] = field?.initialValue || '';
            changed(this.face, fieldId);
        });
    }

    addGroup(btn) {
        return this.withGroupShowKey(btn, (subcardId, key) => {
            const model = subcardId ? this.face[subcardId] : this.face;
            model[key] = true;
            changed(model, key);
        });
    }

    removeField(btn) {
        return this.withFieldId(btn, (subcardId, fieldId) => {
            const model = subcardId ? this.face[subcardId] : this.face;
            model[fieldId] = null;
            changed(model, fieldId);
        });
    }

    removeGroup(btn) {
        return this.withGroupShowKey(btn, (subcardId, key) => {
            const model = subcardId ? this.face[subcardId] : this.face;
            model[key] = false;
            changed(model, key);
        });
    }

    addFace(event) {
        const btn = event.target.closest('sl-button');
        if (!btn || !btn.classList.contains('add-face-btn')) return;
        executeAction('add-face', this.dataset.faceId);
        return true;
    }

    removeFieldOrGroup(event) {
        const btn = event.target.closest('sl-icon-button');
        if (!btn || !btn.classList.contains('remove-btn')) return;
        const removed = this.removeField(btn) || this.removeGroup(btn);
        if (!removed) console.error('Failed to remove', btn.textContent.trim());
        if (removed) emit(this, 'cm-field-changed');
        return true;
    }

    addFieldOrGroup(event) {
        const btn = event.target.closest('sl-button');
        if (!btn || !btn.classList.contains('add-field-btn')) return;
        const added = this.addField(btn) || this.addGroup(btn);
        if (!added) console.error(`Failed to add`, btn.textContent.trim());
        if (added) emit(this, 'cm-field-changed');
        return true;
    }

    onButtonClick(event) {
        return this.addFace(event)
            || this.removeFieldOrGroup(event)
            || this.addFieldOrGroup(event);
    }
}

customElements.define('cm-face-form', FaceForm);
