import './inspectionExceptions.css';
import element from './element.js';
import { COLORS, colorIcon } from './inspectionColors.js';

const L = localize('game-magic');
const PARAMETER_LABELS = { subtype: L`Creature type` };

function colorToggle(color, name, pressed) {
    const button = element('button');
    button.type = 'button';
    button.title = name;
    button.dataset.color = color;
    button.dataset.clickAction = 'toggle';
    button.setAttribute('aria-label', name);
    button.setAttribute('aria-pressed', String(pressed));
    button.append(colorIcon(color));
    return button;
}

function conditionOption(condition) {
    const option = element('sl-option', condition.title);
    option.value = condition.id;
    return option;
}

function withParameter(exception, condition) {
    const { condition: id, colors } = exception;
    if (!condition?.parameter) return { condition: id, colors };
    return { ...exception, [condition.parameter]: exception[condition.parameter] ?? '' };
}

export default class InspectionExceptions extends ReactiveComponent {
    conditions = [];
    exceptions = [];

    get list() {
        return this.querySelector('ul');
    }

    connectedCallback() {
        this.exceptions = structuredClone(this.exceptions);
        this.render();
        this.bind();
    }

    bind() {
        this.handleEvents('click', {
            toggle: event => this.toggle(event.target.closest('button')),
            remove: event => this.remove(this.indexOf(event.target)),
            add: () => this.add()
        });
        this.handleEvents('sl-change', {
            condition: event => this.changeCondition(event.target),
            parameter: event => this.changeParameter(event.target)
        });
    }

    indexOf(control) {
        return Number(control.closest('li').dataset.index);
    }

    conditionOf(exception) {
        return this.conditions.find(condition => condition.id === exception.condition);
    }

    toggle(button) {
        const pressed = button.getAttribute('aria-pressed') === 'true';
        button.setAttribute('aria-pressed', String(!pressed));
        const row = button.closest('li');
        const allowed = row.querySelectorAll('button[aria-pressed="true"]');
        const colors = Array.from(allowed, toggle => toggle.dataset.color);
        this.exceptions[this.indexOf(row)].colors = colors;
        this.changed();
    }

    changeCondition(select) {
        const index = this.indexOf(select);
        const exception = { ...this.exceptions[index], condition: select.value };
        this.exceptions[index] = withParameter(exception, this.conditionOf(exception));
        this.list.children[index].replaceWith(this.row(this.exceptions[index], index));
        this.changed();
    }

    changeParameter(input) {
        const exception = this.exceptions[this.indexOf(input)];
        exception[this.conditionOf(exception).parameter] = input.value.trim();
        this.changed();
    }

    remove(index) {
        this.exceptions.splice(index, 1);
        this.render();
        this.changed();
    }

    add() {
        const [condition] = this.conditions;
        const exception = { condition: condition.id, colors: [] };
        this.exceptions.push(withParameter(exception, condition));
        this.render();
        this.changed();
    }

    changed() {
        this.emit('inspection-exceptions-change', {
            exceptions: structuredClone(this.exceptions)
        });
    }

    render() {
        const list = element('ul');
        const rows = this.exceptions.map((item, index) => this.row(item, index));
        list.append(...rows);
        const add = element('sl-button', L`Add exception`);
        add.size = 'small';
        add.dataset.clickAction = 'add';
        add.disabled = !this.conditions.length;
        this.replaceChildren(list, add);
    }

    row(exception, index) {
        const row = element('li');
        row.dataset.index = String(index);
        row.append(this.conditionSelect(exception));
        const condition = this.conditionOf(exception);
        if (condition?.parameter) row.append(this.parameterInput(exception, condition));
        row.append(this.colorGroup(exception), this.removeButton());
        return row;
    }

    conditionSelect(exception) {
        const select = element('sl-select');
        select.size = 'small';
        select.hoist = true;
        select.dataset.slChangeAction = 'condition';
        select.setAttribute('aria-label', L`Condition`);
        select.append(...this.conditions.map(conditionOption));
        select.value = exception.condition;
        return select;
    }

    parameterInput(exception, condition) {
        const input = element('sl-input');
        input.size = 'small';
        const label = PARAMETER_LABELS[condition.parameter];
        input.placeholder = label;
        input.value = exception[condition.parameter];
        input.dataset.slChangeAction = 'parameter';
        input.setAttribute('aria-label', label);
        return input;
    }

    colorGroup(exception) {
        const colors = element('div');
        colors.setAttribute('role', 'group');
        colors.setAttribute('aria-label', L`Allowed colors`);
        for (const [color, name] of Object.entries(COLORS))
            colors.append(colorToggle(color, name, exception.colors.includes(color)));
        return colors;
    }

    removeButton() {
        const remove = element('sl-icon-button');
        remove.name = 'x-lg';
        remove.label = L`Remove exception`;
        remove.dataset.clickAction = 'remove';
        return remove;
    }
}

customElements.define('cm-inspection-exceptions', InspectionExceptions);
