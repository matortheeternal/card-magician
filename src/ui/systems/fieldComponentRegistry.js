const FieldComponents = [];

export function registerField(fieldClass) {
    customElements.define(fieldClass.tagName, fieldClass);
    FieldComponents.push(fieldClass);
    log('startup').debug('Registered field component', fieldClass.tagName);
}

export function resolveFieldComponent(field) {
    return FieldComponents.find(f => f.matches(field));
}

export function getFieldComponents() {
    return FieldComponents.slice();
}
