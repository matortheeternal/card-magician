import { emit } from '../../utils.js';
import {
    missingFaceMessage, missingFormMessage,
    handleFormGroup, renderFormField, attachSelectOptions
} from './faceFormHelpers.js'

export default class FaceForm extends HTMLElement {
    constructor() {
        super();
        // this allows us to pass these to event listeners
        this.onChange = this.onChange.bind(this);
        this.onButtonClick = this.onButtonClick.bind(this);
    }

    hydrate() {
        this.querySelectorAll('card-form-select')
            .forEach(el => attachSelectOptions(el, this));
    }

    connectedCallback() {
        this.addEventListener('click', this.onButtonClick);
        this.addEventListener('input', this.onChange);
        this.addEventListener('change', this.onChange);
    }

    disconnectedCallback() {
        this.removeEventListener('click', this.onButtonClick);
        this.removeEventListener('input', this.onChange);
        this.removeEventListener('change', this.onChange);
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
        this.fields.forEach(field => renderFormField(field, this));
    }

    render() {
        this.innerHTML = this.getBaseHTML();
        if (!this._face || !this.form || !this.fields) return;
        this.renderFields();
        this.handleGroups();
        this.appendChild(this.form.root);
    }

    set face(value) {
        this._face = value;
        this.render();
        this.hydrate();
    }

    get face() { return this._face; }

    get fields() { return this._face.fields }

    get form() { return this._face.form }

    getField(fieldId) {
        return this.fields.find(field => field.id === fieldId);
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
        return this.withFieldId(btn, fieldId => {
            const field = this.getField(fieldId);
            this._face[fieldId] = field?.initialValue || '';
        })
    }

    addGroup(btn) {
        return this.withGroupShowKey(btn, key => (this._face[key] = true));
    }

    removeField(btn) {
        return this.withFieldId(btn, fieldId => (this._face[fieldId] = null));
    }

    removeGroup(btn) {
        return this.withGroupShowKey(btn, key => (this._face[key] = false));
    }

    onButtonClick(event) {
        this.onIconButtonClick(event);
        const btn = event.target.closest('sl-button');
        if (!btn || !btn.classList.contains('add-field-btn')) return;
        const added = this.addField(btn) || this.addGroup(btn);
        if (!added) console.error(`Failed to add`, btn.textContent.trim());
    }

    onIconButtonClick(event) {
        const btn = event.target.closest('sl-icon-button');
        if (!btn || !btn.classList.contains('remove-btn')) return;
        const removed = this.removeField(btn) || this.removeGroup(btn);
        if (!removed) console.error('Failed to remove', btn.textContent.trim());
    }

    onChange(e) {
        const fieldId = e.target.getAttribute('name');
        if (!fieldId) return;
        this.face[fieldId] = e?.detail?.value || e.target.value || '';
        emit(this, 'save-card');
    }
}

customElements.define('cm-face-form', FaceForm);
