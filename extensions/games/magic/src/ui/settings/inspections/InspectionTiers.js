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
const SEVERITIES = {
    primary: { id: 'allowed', label: L`Allowed` },
    secondary: { id: 'allowed', label: L`Allowed` },
    tertiary: { id: 'bend', label: L`Bend` },
    none: { id: 'break', label: L`Break` }
};

function tierOption([value, label]) {
    const option = element('sl-option', label);
    option.value = value;
    return option;
}

function searchButton(label) {
    const button = element('sl-icon-button');
    button.name = 'search';
    button.label = label;
    button.dataset.clickAction = 'search';
    const tooltip = element('sl-tooltip');
    tooltip.content = label;
    tooltip.hoist = true;
    tooltip.append(button);
    return tooltip;
}

export default class InspectionTiers extends ReactiveComponent {
    defaults = {};
    overrides = {};
    cards = '';

    connectedCallback() {
        this.render();
        this.bind();
    }

    bind() {
        this.on('sl-change', event => this.changeTier(event.target));
        this.handleEvents('click', {
            search: event => this.emit('inspection-search', {
                color: event.target.closest('[data-color]').dataset.color
            })
        });
    }

    changeTier(select) {
        const tile = select.closest('[data-color]');
        this.showSeverity(tile, select.value);
        const { color } = tile.dataset;
        this.emit('inspection-tier-change', { color, tier: select.value });
    }

    tierOf(color) {
        return this.overrides[color] ?? this.defaults[color];
    }

    render() {
        this.replaceChildren(...Object.entries(COLORS).map(entry => this.tile(entry)));
    }

    tile([color, name]) {
        const tile = element('section');
        tile.dataset.color = color;
        const watermark = activeGame.symbols.resolveColorSymbolIcon(color.toLowerCase());
        tile.style.setProperty('--watermark', `url("${watermark}")`);
        tile.setAttribute('aria-label', name);
        const heading = element('header');
        const search = searchButton(L`Search Scryfall for ${name} ${this.cards}`);
        heading.append(colorIcon(color), element('strong', name), search);
        const select = element('sl-select');
        select.size = 'small';
        select.hoist = true;
        select.setAttribute('aria-label', L`${name} tier`);
        select.append(...Object.entries(TIERS).map(tierOption));
        select.value = this.tierOf(color);
        tile.append(heading, select, element('small'));
        this.showSeverity(tile, select.value);
        return tile;
    }

    showSeverity(tile, tier) {
        const severity = SEVERITIES[tier];
        tile.dataset.severity = severity.id;
        tile.querySelector('small').textContent = severity.label;
    }
}

customElements.define('cm-inspection-tiers', InspectionTiers);
