import { renderField } from './cardFormField.js';
import Alpine from 'alpinejs';
import { emit } from '../../utils.js';

function renderAddButton(label) {
    return (
        `<sl-button class="add-field-btn" size="small" variant="success" outline>
            <sl-icon slot="prefix" name="plus-lg"></sl-icon>
            Add ${label}
        </sl-button>`
    );
}

function renderToggle(show, label) {
    return show ? (
        `<sl-tooltip content="Remove ${label}">
            <sl-icon-button class="remove-btn" name="x-lg"></sl-icon-button>
        </sl-tooltip>`
    ) : renderAddButton(label);
}

function createToggle(formGroup, className) {
    const toggleGroup = document.createElement('div');
    toggleGroup.className = className;
    formGroup.appendChild(toggleGroup);
    return toggleGroup;
}

function renderGroups(face, element) {
    if (!face.form) return;
    const formGroups = face.form.root.querySelectorAll('form-group');
    formGroups.forEach(formGroup => {
        const showKey = formGroup.getAttribute('show');
        const optional = formGroup.hasAttribute('optional');
        if (!showKey) return;
        const childFields = Array.from(formGroup.children);
        const toggleGroup = optional && createToggle(formGroup, 'toggle-group');
        Alpine.effect(() => {
            const show = face[showKey];
            for (const child of childFields)
                child.style.display = show ? 'block' : 'none';
            if (!toggleGroup) return;
            formGroup.toggleAttribute('active', show);
            const label = formGroup.getAttribute('label');
            toggleGroup.innerHTML = renderToggle(show, label);
            emit(element, 'save-card');
        });
    });
}

function renderFields(face, element) {
    if (!face.fields) return;
    face.fields.forEach(field => {
        const selector = `form-field[field-id="${field.id}"]`;
        const container = face.form.root.querySelector(selector);
        if (!container) return;
        const optional = container.hasAttribute('optional');
        container.innerHTML = renderField(field, face);
        if (!optional) return;
        const childField = container.firstElementChild;
        const toggleField = createToggle(container, 'toggle-field');
        Alpine.effect(() => {
            const show = face[field.id] !== null
                && face[field.id] !== undefined;
            childField.style.display = show ? 'block' : 'none';
            toggleField.innerHTML = renderToggle(show, field.displayName);
            emit(element, 'save-card');
        });
    });
}

function missingFaceMessage(faceId) {
    return (
        `<div class="no-content-prompt">
            <span>This card does not have a ${faceId} face.</span>
            <div class="buttons-container">
                <sl-button class="add-face-btn" size="large">Add ${faceId} face</sl-button>
            </div>
        </div>`
    );
}

function missingFormMessage() {
    return (
        `<div class="no-content-prompt">
            <span>This face does not have any fields to display.</span>
        </div>`
    );
}

class FaceForm extends HTMLElement {
    constructor() {
        super();
        // this allows us to pass these to event listeners
        this.onChange = this.onChange.bind(this);
        this.onButtonClick = this.onButtonClick.bind(this);
    }

    hydrate() {
        this.querySelectorAll('card-form-select').forEach(el => {
            const fieldId = el.dataset.fieldId;
            const field = this.getField(fieldId);
            if (!field) {
                console.error(`Failed to resolve field ${fieldId}`);
                return;
            }
            if (!field.options)
                console.error(`Field ${fieldId} has no options`);
            el.options = field.options || [];
        });
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
        if (!this._face.form || !this._face.fields)
            return missingFormMessage();
        return '';
    }

    render() {
        this.innerHTML = this.getBaseHTML();
        if (!this._face || !this._face.form || !this._face.fields) return;
        renderFields(this._face, this);
        renderGroups(this._face, this);
        this.appendChild(this._face.form.root);
    }

    set face(value) {
        this._face = value;
        this.render();
        this.hydrate();
    }

    get face() { return this._face; }

    getField(fieldId) {
        return this._face.fields.find(field => field.id === fieldId);
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
