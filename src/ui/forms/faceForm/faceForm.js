import { emit } from '../../../shared/htmlUtils.js';
import {
    missingFaceMessage, missingFormMessage,
    handleFormGroup, renderFormField
} from './faceFormHelpers.js'
import { hydrateFields } from '../fieldComponents/fieldComponentManager.js';
import { executeAction } from '../../systems/actionSystem.js';

export default class FaceForm extends HTMLElement {
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

    getBaseHTML() {
        const faceId = this.dataset.faceId
        if (!this._face) return missingFaceMessage(faceId);
        if (!this.form || !this.fields)
            return missingFormMessage();
        return '';
    }

    handleGroups() {
        if (!this.form) return;
        const formGroups = this.form.root.querySelectorAll('form-group');
        formGroups.forEach(formGroup => handleFormGroup(formGroup, this));
    }

    renderFields() {
        if (!this.fields) return;
        this.fields.forEach(field => renderFormField(this.face, field, this));
        this.subcards.forEach(subcard => {
            subcard.fields.forEach(
                field => renderFormField(subcard, field, this)
            );
        });
    }

    render() {
        this.innerHTML = this.getBaseHTML();
        if (!this.face || !this.form || !this.fields) return;
        this.renderFields();
        this.handleGroups();
        this.appendChild(this.form.root);
    }

    set face(value) {
        this._face = value;
        this.render();
        hydrateFields(this);
    }

    get face() { return this._face }
    get form() { return this._face.form }
    get fields() { return this._face.fields }
    get subcards() { return this._face.subcards }

    getField(subcardId, fieldId) {
        const target = subcardId
            ? this.subcards.find(s => s.id === subcardId)
            : this._face;
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
            this._face[fieldId] = field?.initialValue || '';
        })
    }

    addGroup(btn) {
        // TODO: handle subcards
        return this.withGroupShowKey(btn, key => (this._face[key] = true));
    }

    removeField(btn) {
        return this.withFieldId(btn, fieldId => (this._face[fieldId] = null));
    }

    removeGroup(btn) {
        return this.withGroupShowKey(btn, key => (this._face[key] = false));
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
