function useInputDebounce(field) {
    return field.type === 'text' || field.type === 'textarea' || !field.type;
}

const applyOnChange = function(field, input) {
    if (!field.onChange) return;
    const attribute = useInputDebounce(field)
        ? 'x-on:input.debounce'
        : 'x-on:change';
    input.setAttribute(attribute, field.onChange);
}

const TYPES_TO_TAGS = {
    textarea: 'textarea',
    select: 'select'
};

const addSelectOptions = function(select, field) {
    for (let option of field.options) {
        const element = document.createElement('option');
        element.innerText = option;
        select.appendChild(element);
    }
}

const makeFormInput = function(field) {
    const tagName = TYPES_TO_TAGS[field.type] || 'input';
    const input = document.createElement(tagName);
    if (field.type === 'select') addSelectOptions(input, field);
    input.setAttribute('type', field.type || 'text');
    input.setAttribute('x-model', field.id);
    applyOnChange(field, input);
    return input;
}

export function buildForm(card) {
    const form = document.createElement('form');
    form.setAttribute('onsubmit', 'return false');
    for (let field of card.fields) {
        const label = document.createElement('label');
        const labelSpan = document.createElement('span');
        labelSpan.innerText = field.displayName;
        label.appendChild(labelSpan);
        const input = makeFormInput(field);
        label.appendChild(input);
        form.appendChild(label);
    }
    return form;
}
