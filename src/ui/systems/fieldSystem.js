import ImageFieldValue from '../../domain/card/ImageFieldValue.js';

function firstOption(field) { return field.options?.[0]?.id || null; }

const INITIAL_VALUES = new Map([
    ['checkboxlist', () => ({})],
    ['select', firstOption],
    ['nested-menu', firstOption],
    ['multiselect', () => []],
    ['image', () => new ImageFieldValue()]
]);

export function getInitialValue(field) {
    if (field.override) return field.override;
    const createValue = INITIAL_VALUES.get(field.type);
    if (!createValue) return '';
    return createValue(field);
}

export function getDefaultValue(field) {
    if (Object.hasOwn(field, 'default')) return field.default;
    return getInitialValue(field);
}

export function initializeFields(fields, obj = {}) {
    for (const field of fields)
        obj[field.id] ||= getDefaultValue(field);
    return obj;
}
