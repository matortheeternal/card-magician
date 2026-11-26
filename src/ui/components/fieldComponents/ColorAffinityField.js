import FieldComponent from './FieldComponent.js';
import { esc, emit } from '../../../shared/htmlUtils.js';
import { registerField } from '../../systems/fieldComponentRegistry.js';

const L = localize('color-affinity-field');
const tiers = new Map([
    ['none', L`Never`], ['primary', L`Primary`],
    ['secondary', L`Secondary`], ['tertiary', L`Tertiary`]
]);

export default class ColorAffinityField extends FieldComponent {
    static tagName = 'cm-color-affinity';
    eventKey = 'cm-affinity-change';

    static matches(field) { return field.type === 'color-affinity'; }

    get buttons() { return this.querySelectorAll('sl-button[data-color]'); }

    bind() {
        super.bind();
        this.handleEvents('click', {
            cycle: event => this.cycle(event.target.closest('[data-color]'))
        });
    }

    cycle(button) {
        const order = [...tiers.keys()];
        const index = order.indexOf(button.dataset.tier);
        const tier = order[(index + 1) % order.length];
        const value = { ...this.value };
        if (tier === 'none') delete value[button.dataset.color];
        if (tier !== 'none') value[button.dataset.color] = tier;
        emit(this, this.eventKey, value);
    }

    getChangedValue(event) { return event.detail; }

    loadValue() {
        for (const button of this.buttons) {
            const { color, name } = button.dataset;
            const value = this.value?.[color];
            const tier = tiers.has(value) ? value : 'none';
            const label = L`${name} · ${tiers.get(tier)}`;
            button.dataset.tier = tier;
            button.title = label;
            button.setAttribute('aria-label', label);
        }
    }

    render() {
        const buttons = this.field.options.map(({ id, name, icon }) => `
            <sl-button size="small" data-click-action="cycle" data-color="${esc(id)}"
                       data-name="${esc(name)}">
                <img src="${esc(icon)}" alt="" />
            </sl-button>`).join('');
        this.innerHTML = `
            <fieldset>
                <legend>${this.field.label}</legend>
                <div class="field-box">${buttons}</div>
            </fieldset>`;
        this.loadValue();
    }
}

registerField(ColorAffinityField);
