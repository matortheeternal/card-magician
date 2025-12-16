const FieldComponents = [];

export function registerField(fieldClass) {
    customElements.define(fieldClass.tagName, fieldClass);
    FieldComponents.push(fieldClass);
}

export function resolveFieldComponent(field) {
    return FieldComponents.find(f => f.matches(field));
}

export function renderField(container, field) {
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
    for (const Component of FieldComponents) {
        const elements = root.querySelectorAll(Component.tagName);
        for (const element of elements) {
            const parentFormField = element.closest('form-field');
            const fieldId = parentFormField?.getAttribute('field-id');
            const subcardId = parentFormField?.getAttribute('subcard-id');
            if (!fieldId) continue;
            element.field = root.getField(subcardId, fieldId);
            element.model = subcardId
                ? root.subcards.find(s => s.id === subcardId)
                : root.face;
        }
    }
}
