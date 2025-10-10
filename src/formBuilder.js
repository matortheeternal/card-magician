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
    textarea: 'sl-textarea',
    select: 'sl-select'
};

const addSelectOptions = function(select, field) {
    for (let option of field.options) {
        const element = document.createElement('sl-option');
        element.innerText = option;
        select.appendChild(element);
    }
}

const makeFormInput = function(field) {
    const tagName = TYPES_TO_TAGS[field.type] || 'sl-input';
    const input = document.createElement(tagName);
    if (field.type === 'select') addSelectOptions(input, field);
    if (field.type === 'textarea')
        input.setAttribute('resize', 'auto');
    if (tagName === 'input' && field.type)
        input.setAttribute('type', field.type);
    input.setAttribute('label', field.displayName);
    input.setAttribute('x-model', field.id);
    applyOnChange(field, input);
    return input;
}

function makeFormButton(label, action) {
    const button = document.createElement('sl-button');
    button.textContent = label;
    button.setAttribute('x-on:click', action);
    return button;
}

function buildCardForm(container, card) {
    const h2 = document.createElement('h2');
    h2.textContent = card.id;
    container.appendChild(h2);
    const section = document.createElement('section');
    section.setAttribute('x-scope', card.id);
    for (let field of card.fields)
        section.appendChild(makeFormInput(field));
    for (let subcard of Object.values(card.subCards))
        buildCardForm(section, subcard);
    container.appendChild(section);
}

export function buildForms(cardNamespace) {
    const formsContainer = document.createElement('div');
    formsContainer.className = 'forms-container';
    for (let card of Object.values(cardNamespace)) {
        const form = document.createElement('div');
        form.className = 'form';
        buildCardForm(form, card);
        form.appendChild(makeFormButton('save', 'await save()'));
        form.appendChild(makeFormButton('load', 'await load()'));
        form.appendChild(makeFormButton('export', 'await exportImg()'));
        formsContainer.appendChild(form);
    }
    return formsContainer;
}
