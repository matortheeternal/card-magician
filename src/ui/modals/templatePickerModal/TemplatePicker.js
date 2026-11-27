import ReactiveComponent from '../../components/ReactiveComponent.js';
import { AUTO_TEMPLATE } from '../../../domain/template/autoTemplate.js';
import { emit, esc, escapeHTML } from '../../../shared/htmlUtils.js';
import {
    getPreferredTemplateDefault, getTemplateFamily
} from '../../../domain/template/templateRegistry.js';
import { templateLabel } from './templateLabels.js';

const L = localize('template-picker');
const whitespace = /\s+/u;
const familyOrder = new Map(['', 'M15', 'M20', 'Classic'].map(
    (family, index) => [family, index]
));

function compareFamilies([a], [b]) {
    const priorityA = familyOrder.get(a) ?? familyOrder.size;
    const priorityB = familyOrder.get(b) ?? familyOrder.size;
    return priorityA - priorityB || a.localeCompare(b);
}

function matchesQuery(option, query) {
    const text = `${option.label} ${option.family} ${option.id}`.toLowerCase();
    return query.every(word => text.includes(word));
}

export default class TemplatePicker extends ReactiveComponent {
    expandedFamilies = new Set();
    searching = false;

    get familyGroups() {
        return this.results.querySelectorAll('details');
    }
    get search() {
        return this.querySelector('sl-input');
    }

    get results() {
        return this.querySelector('[data-template-results]');
    }

    get firstResult() {
        return this.results.querySelector('[data-option-index]');
    }

    connectedCallback() {
        this.render();
        this.bind();
    }

    bind() {
        this.on('sl-input', () => this.renderResults());
        this.on('keydown', event => this.onKeyDown(event));
        this.on('click', event => {
            const button = event.target.closest('[data-option-index]');
            if (button) this.select(button);
        });
    }

    onKeyDown(event) {
        if (event.target !== this.search || event.isComposing) return;
        if (event.key !== 'Enter' || !this.search.value.trim() || !this.firstResult)
            return;
        event.preventDefault();
        this.select(this.firstResult);
    }

    select(button) {
        const option = this.options[button.dataset.optionIndex];
        emit(this, 'cm-template-selected', { id: option.id });
    }

    setTemplates(templates, selected) {
        this.selected = selected;
        const preferred = getPreferredTemplateDefault();
        this.expandedFamilies = new Set([getTemplateFamily(preferred)]);
        const defaultId = preferred?.id;
        const ordered = templates.toSorted((a, b) =>
            Number(b.id === defaultId) - Number(a.id === defaultId)
        );
        this.options = [
            { id: AUTO_TEMPLATE, label: L`Auto`, family: '' },
            ...ordered.map(template => ({
                id: template.id,
                family: getTemplateFamily(template) || L`Other templates`,
                label: templateLabel(template),
                version: template.version,
                iconUrl: template.iconUrl
            }))
        ];
        this.renderResults();
    }

    render() {
        this.innerHTML = (
            `<header>
                <sl-input type="search" label="${L`Search templates`}"
                    autocomplete="off" clearable></sl-input>
            </header>
            <div data-template-results></div>`
        );
    }

    renderOption(option, index) {
        const current = option.id === this.selected ? 'aria-current="true"' : '';
        const icon = option.iconUrl
            ? `<img src="${esc(option.iconUrl)}" alt="" loading="lazy">` : '';
        return (
            `<button type="button" ${current}
                data-option-index="${index}">
                ${icon}<span>${option.label}</span>
            </button>`
        );
    }

    renderGroup(family, options) {
        if (!family) return `<div class="auto-template">${options.join('')}</div>`;
        const open = this.searching || this.expandedFamilies.has(family) ? 'open' : '';
        return (
            `<details ${open} data-family="${esc(escapeHTML(family))}">
                <summary>${escapeHTML(family)}</summary>
                <div class="template-grid">${options.join('')}</div>
            </details>`
        );
    }

    rememberExpansion() {
        for (const group of this.familyGroups) {
            const family = group.dataset.family;
            if (group.open) {
                this.expandedFamilies.add(family);
                continue;
            }
            this.expandedFamilies.delete(family);
        }
    }

    renderResults() {
        if (!this.searching) this.rememberExpansion();
        const search = this.search.value.trim();
        this.searching = Boolean(search);
        const query = search.toLowerCase().split(whitespace);
        const groups = new Map();
        for (const [index, option] of this.options.entries()) {
            if (!matchesQuery(option, query)) continue;
            if (!groups.has(option.family)) groups.set(option.family, []);
            groups.get(option.family).push(this.renderOption(option, index));
        }
        const sections = [...groups].sort(compareFamilies);
        this.results.innerHTML = sections.map(group => this.renderGroup(...group))
            .join('') || `<p>${L`No matching templates.`}</p>`;
        this.results.scrollTop = 0;
    }
}

customElements.define('cm-template-picker', TemplatePicker);
