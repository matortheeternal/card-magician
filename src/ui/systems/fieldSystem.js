import ImageFieldValue from '../../domain/card/ImageFieldValue.js';
import { resolveFieldComponent } from './fieldComponentRegistry.js';

const L = localize('field-system');

export function getDefaultValue(field) {
    if (Object.hasOwn(field, 'default')) return field.default;
    if (field.type === 'checkboxlist') return {};
    if (field.type === 'select') return field.options?.[0]?.id || null;
    if (field.type === 'multiselect') return [];
    if (field.type === 'image') return new ImageFieldValue();
    return '';
}

export function initializeFields(fields, obj = {}) {
    for (const field of fields)
        obj[field.id] = getDefaultValue(field);
    return obj;
}

export function createFieldComponent(container, field, model) {
    const Component = resolveFieldComponent(field);
    if (!Component) {
        console.error('Skipped rendering unknown field type', field.type);
        return;
    }
    const fieldElement = document.createElement(Component.tagName);
    container.appendChild(fieldElement);
    fieldElement.field = field;
    fieldElement.model = model;
    return fieldElement;
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

function handleOptionalField(fieldElement, container, model, field, { effect }) {
    const optional = container.hasAttribute('optional');
    if (!optional) return;

    const toggleField = createToggle(container, 'toggle-field');
    effect(() => {
        const show = model[field.id] !== null
            && model[field.id] !== undefined;
        fieldElement.style.display = show ? 'block' : 'none';
        toggleField.innerHTML = renderToggle(show, field.label);
    });
}

function getDefaultSelector(field) {
    return `form-field[field-id="${field.id}"]:not([subcard-id])`;
}

export function renderFields(root, model, fields, ctx = {}) {
    if (!fields) return;
    ctx = {
        getSelector: getDefaultSelector,
        effect: root.effect,
        ...ctx
    };
    fields.forEach(field => {
        const selector = ctx.getSelector(field);
        const container = root.querySelector(selector);
        if (!container) return;
        const fieldElement = createFieldComponent(container, field, model);
        handleOptionalField(fieldElement, container, model, field, ctx);
    });
}

function toggleGroupChildren(formGroup, model, toggleGroup) {
    const showKey = formGroup.getAttribute('show');
    const show = model[showKey];
    for (const child of formGroup.children)
        child.style.display = show ? 'block' : 'none';

    formGroup.toggleAttribute('active', show);
    const label = formGroup.getAttribute('label');
    toggleGroup.innerHTML = renderToggle(show, label);
}

function toggleGroupVisibility(formGroup, model) {
    const showKey = formGroup.getAttribute('show');
    formGroup.style.display = model[showKey] ? '' : 'none';
}

export function handleFormGroup(formGroup, model, effect) {
    if (!formGroup.hasAttribute('show')) return;
    const optional = formGroup.hasAttribute('optional');
    const toggleGroup = optional ? createToggle(formGroup, 'toggle-group') : null;
    return effect(optional
        ? () => toggleGroupChildren(formGroup, model, toggleGroup)
        : () => toggleGroupVisibility(formGroup, model));
}
