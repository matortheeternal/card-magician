import { emit } from '../../../shared/htmlUtils.js';
import { executeAction } from '../../systems/actionSystem.js';
import {
    handleFormGroup,
    hydrateFields,
    renderFields
} from '../../systems/fieldSystem.js';

const L = localize('face-form');

export default class FaceForm extends HTMLElement {
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
        formGroups.forEach(formGroup => handleFormGroup(formGroup, this.face));
    }

    resolveFields(obj) {
        return obj.fields;
    }

    render() {
        this.innerHTML = this.getBaseHTML();
        if (!this.face || !this.form || !this.fields) return;
        renderFields(this.form.root, this.face, this.fields);
        this.subcards.forEach(subcard => {
            const subcardFields = this.resolveFields(subcard);
            renderFields(this.form.root, subcard, subcardFields);
        });
        this.handleGroups();
        this.appendChild(this.form.root);
    }

    set face(value) {
        this.#face = value;
        this.render();
        hydrateFields(this);
    }

    get face() { return this.#face; }
    get form() { return this.#face.form; }
    get fields() { return this.#face.fields; }
    get subcards() { return this.#face.subcards; }

    getSelector(model, field) {
        return `form-field[field-id="${field.id}"]` + (model.isSubcard
            ? `[subcard-id="${model.id}"]`
            : ':not([subcard-id])');
    }

    getModel(subcardId) {
        return subcardId
            ? this.subcards.find(s => s.id === subcardId)
            : this.face;
    }

    getField(subcardId, fieldId) {
        const target = subcardId
            ? this.subcards.find(s => s.id === subcardId)
            : this.face;
        return target.fields.find(field => field.id === fieldId);
    }

    withFieldId(btn, callback) {
        const fieldElement = btn.closest('form-field');
        const fieldId = fieldElement?.getAttribute('field-id');
        if (!fieldId) return false;
        callback(fieldId);
        return true;
    }

    withGroupShowKey(btn, callback) {
        const groupElement = btn.closest('form-group');
        const showKey = groupElement?.getAttribute('show');
        if (!showKey) return false;
        callback(showKey);
        return true;
    }

    addField(btn) {
        // TODO: handle subcards
        return this.withFieldId(btn, fieldId => {
            const field = this.getField(null, fieldId);
            this.face[fieldId] = field?.initialValue || '';
        });
    }

    addGroup(btn) {
        // TODO: handle subcards
        return this.withGroupShowKey(btn, key => (this.face[key] = true));
    }

    removeField(btn) {
        return this.withFieldId(btn, fieldId => (this.face[fieldId] = null));
    }

    removeGroup(btn) {
        return this.withGroupShowKey(btn, key => (this.face[key] = false));
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
