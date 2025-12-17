import ImageFieldValue from '../../domain/card/ImageFieldValue.js';
import { getFieldComponents, resolveFieldComponent } from './fieldComponentRegistry.js';
import Alpine from 'alpinejs';

const L = localize('field-system');

export function getDefaultValue(field) {
    if (field.hasOwnProperty('default')) return field.default;
    if (field.type === 'checkboxlist') return {};
    if (field.type === 'select') return field.options?.[0]?.id || null;
    if (field.type === 'multiselect') return [];
    if (field.type === 'image') return new ImageFieldValue();
    return '';
}

export function initializeFields(fields, obj = {}) {
    fields.forEach(field => {
        obj[field.id] = getDefaultValue(field);
    });
    return obj;
}

export function createFieldComponent(container, field) {
    const Component = resolveFieldComponent(field);
    if (!Component) {
        console.error('Skipped rendering unknown field type', field.type);
        return;
    }
    const fieldElement = document.createElement(Component.tagName);
    container.appendChild(fieldElement);
    return fieldElement;
}

export function hydrateFields(root) {
    for (const Component of getFieldComponents()) {
        const elements = root.querySelectorAll(Component.tagName);
        for (const element of elements) {
            const parentFormField = element.closest('form-field');
            const fieldId = parentFormField?.getAttribute('field-id');
            const subcardId = parentFormField?.getAttribute('subcard-id');
            if (!fieldId) continue;
            element.field = root.getField(subcardId, fieldId);
            element.model = root.getModel(subcardId);
        }
    }
}

function renderAddButton(label) {
    return (
        `<sl-button class="add-field-btn" size="small" variant="success" outline>
            <sl-icon slot="prefix" name="plus-lg"></sl-icon>
            ${L`Add ${label}`}
        </sl-button>`
    );
}

function renderToggle(show, label) {
    return show ? (
        `<sl-tooltip content="${L`Remove ${label}`}">
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

export function getSelector(model, field) {
    return `form-field[field-id="${field.id}"]` + (model.isSubcard
        ? `[subcard-id="${model.id}"]`
        : ':not([subcard-id])');
}

export function renderFields(root, model, fields) {
    if (!fields) return;
    fields.forEach(field => {
        const selector = getSelector(model, field);
        const container = root.querySelector(selector);
        if (!container) return;
        const optional = container.hasAttribute('optional');
        const fieldElement = createFieldComponent(container, field);
        if (!optional) return;
        const toggleField = createToggle(container, 'toggle-field');
        Alpine.effect(() => {
            const show = model[field.id] !== null
                && model[field.id] !== undefined;
            fieldElement.style.display = show ? 'block' : 'none';
            toggleField.innerHTML = renderToggle(show, field.label);
        });
    })
}

export function handleFormGroup(formGroup, model) {
    const showKey = formGroup.getAttribute('show');
    const optional = formGroup.hasAttribute('optional');
    if (!showKey) return;
    const childFields = Array.from(formGroup.children);
    const toggleGroup = optional ? createToggle(formGroup, 'toggle-group') : null;
    Alpine.effect(() => {
        const show = model[showKey];
        if (!toggleGroup) {
            if (!show) formGroup.style.display = 'none';
            if (show) formGroup.style.removeProperty('display');
            return;
        }
        for (const child of childFields)
            child.style.display = show ? 'block' : 'none';
        formGroup.toggleAttribute('active', show);
        const label = formGroup.getAttribute('label');
        toggleGroup.innerHTML = renderToggle(show, label);
    });
}
