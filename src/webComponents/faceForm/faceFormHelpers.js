import { emit } from '../../utils.js';
import Alpine from 'alpinejs';
import { renderField } from '../../services/fieldElementRegistry.js';

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

export function missingFaceMessage(faceId) {
    return (
        `<div class="no-content-prompt">
            <span>This card does not have a ${faceId} face.</span>
            <div class="buttons-container">
                <sl-button class="add-face-btn" size="large">Add ${faceId} face</sl-button>
            </div>
        </div>`
    );
}

export function handleFormGroup(formGroup, faceForm) {
    const showKey = formGroup.getAttribute('show');
    const optional = formGroup.hasAttribute('optional');
    if (!showKey) return;
    const childFields = Array.from(formGroup.children);
    const toggleGroup = optional ? createToggle(formGroup, 'toggle-group') : null;
    Alpine.effect(() => {
        const show = faceForm.face[showKey];
        for (const child of childFields)
            child.style.display = show ? 'block' : 'none';
        if (!toggleGroup) return;
        formGroup.toggleAttribute('active', show);
        const label = formGroup.getAttribute('label');
        toggleGroup.innerHTML = renderToggle(show, label);
    });
}

function getSelector(face, field) {
    return `form-field[field-id="${field.id}"]` + (face.isSubcard
        ? `[subcard-id="${face.id}"]`
        : ':not([subcard-id])');
}

export function renderFormField(face, field, faceForm) {
    const selector = getSelector(face, field);
    const container = faceForm.form.root.querySelector(selector);
    if (!container) return;
    const optional = container.hasAttribute('optional');
    renderField(container, field);
    if (!optional) return;
    const childField = container.firstElementChild;
    const toggleField = createToggle(container, 'toggle-field');
    Alpine.effect(() => {
        const show = face[field.id] !== null
            && face[field.id] !== undefined;
        childField.style.display = show ? 'block' : 'none';
        toggleField.innerHTML = renderToggle(show, field.label);
    });
}

export function missingFormMessage() {
    return (
        `<div class="no-content-prompt">
            <span>This face does not have any fields to display.</span>
        </div>`
    );
}
