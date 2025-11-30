const FieldElements = [];

export function registerField(fieldClass) {
    customElements.define(fieldClass.tagName, fieldClass);
    FieldElements.push(fieldClass);
}

export function resolveFieldElement(field) {
    return FieldElements.find(f => f.matches(field));
}

export function renderField(container, field) {
    const FieldElement = resolveFieldElement(field);
    if (!FieldElement) {
        console.error('Skipped rendering unknown field type', field.type);
        return;
    }
    container.innerHTML = `<${FieldElement.tagName}></${FieldElement.tagName}>`;
}

export function hydrateFields(root) {
    for (const FieldElement of FieldElements) {
        const elements = root.querySelectorAll(FieldElement.tagName);
        for (const element of elements) {
            const parentFormField = element.closest('form-field');
            const fieldId = parentFormField?.getAttribute('field-id');
            if (!fieldId) continue;
            element.field = root.getField(fieldId);
            element.model = root.face;
        }
    }
}
