const FieldComponents = [];

export function registerField(fieldClass) {
    customElements.define(fieldClass.tagName, fieldClass);
    FieldComponents.push(fieldClass);
}

export function resolveFieldComponent(field) {
    return FieldComponents.find(f => f.matches(field));
}

export function getFieldComponents() {
    return FieldComponents.slice();
}
