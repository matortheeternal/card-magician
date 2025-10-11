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
    select: 'sl-select',
    image: 'image-select'
};

const addSelectOptions = function(select, field) {
    for (let option of field.options) {
        const element = document.createElement('sl-option');
        element.textContent = option;
        element.setAttribute('value', option);
        select.appendChild(element);
    }
}

const makeFormInput = function(field) {
    const tagName = TYPES_TO_TAGS[field.type] || 'sl-input';
    const input = document.createElement(tagName);
    if (field.type === 'select')
        addSelectOptions(input, field);
    if (field.type === 'textarea') {
        input.setAttribute('resize', 'auto');
        input.setAttribute('spellcheck', 'false');
    }
    if (tagName === 'sl-input' && field.type)
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

function getFieldContainer(groups, field, container) {
    if (!field.group) return container;
    if (groups.hasOwnProperty(field.group))
        return groups[field.group];

    const group = document.createElement('div');
    groups[field.group] = group;
    group.className = 'field-group';
    container.appendChild(group);
    return group;
}

function buildCardForm(container, card) {
    const h2 = document.createElement('h2');
    h2.textContent = card.id;
    container.appendChild(h2);
    const section = document.createElement('section');
    section.setAttribute('x-scope', card.id);
    const groups = {};
    for (let field of card.fields) {
        const container = getFieldContainer(groups, field, section);
        container.appendChild(makeFormInput(field));
    }
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
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'buttons-container';
        buttonsContainer.appendChild(makeFormButton('save', 'await save()'));
        buttonsContainer.appendChild(makeFormButton('load', 'await load()'));
        buttonsContainer.appendChild(makeFormButton('export', 'await exportImg()'));
        form.appendChild(buttonsContainer);
        formsContainer.appendChild(form);
    }
    return formsContainer;
}
