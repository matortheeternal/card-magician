import './inspectionExceptions.css';
import element from './element.js';
import { COLORS, colorIcon } from './inspectionColors.js';

const L = localize('game-magic');

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

export default class InspectionExceptions extends ReactiveComponent {
    exceptions = [];
    overrides = {};

    connectedCallback() {
        this.render();
        this.bind();
    }

    bind() {
        this.handleEvents('click', {
            toggle: event => this.toggle(event.target.closest('button'))
        });
    }

    toggle(button) {
        const pressed = button.getAttribute('aria-pressed') === 'true';
        button.setAttribute('aria-pressed', String(!pressed));
        const row = button.closest('li');
        const allowed = row.querySelectorAll('button[aria-pressed="true"]');
        this.emit('inspection-exception-change', {
            exceptionId: row.dataset.exceptionId,
            colors: Array.from(allowed, toggle => toggle.dataset.color)
        });
    }

    colorsOf(exception) {
        return this.overrides[exception.id] ?? exception.colors;
    }

    render() {
        const list = element('ul');
        list.append(...this.exceptions.map(exception => this.row(exception)));
        this.replaceChildren(list);
    }

    row(exception) {
        const row = element('li');
        row.dataset.exceptionId = exception.id;
        const colors = element('div');
        colors.setAttribute('role', 'group');
        colors.setAttribute('aria-label', L`Colors allowed for ${exception.title}`);
        const allowed = this.colorsOf(exception);
        for (const [color, name] of Object.entries(COLORS))
            colors.append(colorToggle(color, name, allowed.includes(color)));
        row.append(element('span', exception.title), colors);
        return row;
    }
}

customElements.define('cm-inspection-exceptions', InspectionExceptions);
