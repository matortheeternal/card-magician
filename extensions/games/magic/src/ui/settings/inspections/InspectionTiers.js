import './inspectionTiers.css';
import element from './element.js';
import { COLORS, colorIcon } from './inspectionColors.js';

const L = localize('game-magic');
const TIERS = {
    primary: L`Primary`,
    secondary: L`Secondary`,
    tertiary: L`Tertiary`,
    none: L`None`,
};
const SEVERITIES = { tertiary: L`Bend`, none: L`Break` };

function tierOption([value, label]) {
    const option = element('sl-option', label);
    option.value = value;
    return option;
}

function colorLabel(color, name) {
    const label = element('span', name);
    label.slot = 'label';
    label.prepend(colorIcon(color));
    return label;
}

function updateStatus(select) {
    const status = select.nextElementSibling;
    const severity = SEVERITIES[select.value];
    status.textContent = severity ?? L`Allowed`;
    status.dataset.severity = severity ? select.value : '';
}

export default class InspectionTiers extends ReactiveComponent {
    defaults = {};
    overrides = {};

    connectedCallback() {
        this.render();
        this.bind();
    }

    bind() {
        this.on('sl-change', event => {
            const select = event.target;
            updateStatus(select);
            this.emit('inspection-tier-change', {
                color: select.dataset.color,
                tier: select.value
            });
        });
    }

    tierOf(color) {
        return this.overrides[color] ?? this.defaults[color];
    }

    render() {
        this.replaceChildren(...Object.entries(COLORS).map(entry => this.tile(entry)));
    }

    tile([color, name]) {
        const tile = element('div');
        const select = element('sl-select');
        select.size = 'small';
        select.dataset.color = color;
        select.append(colorLabel(color, name), ...Object.entries(TIERS).map(tierOption));
        select.value = this.tierOf(color);
        tile.append(select, element('small'));
        updateStatus(select);
        return tile;
    }
}

customElements.define('cm-inspection-tiers', InspectionTiers);
