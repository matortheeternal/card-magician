import ImageFieldValue from '../../domain/card/ImageFieldValue.js';

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
