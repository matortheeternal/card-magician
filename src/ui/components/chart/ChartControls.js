import ReactiveComponent from '../ReactiveComponent.js';
import { categorySymbol } from './categoryLabel.js';
import html from './chartControls.html.js';

const L = localize('statistics');

function seriesContent(category) {
    if (category.icon) return [categorySymbol(category)];
    if (category.gradient)
        return [categorySymbol(category), document.createTextNode(category.label)];
    return [document.createTextNode(category.label)];
}

export default class ChartControls extends ReactiveComponent {
    connectedCallback() {
        this.render();
        this.bind();
    }

    get title() { return this.querySelector('h2'); }
    get description() { return this.querySelector('.stats-description'); }
    get typeSwitch() { return this.querySelector('.stats-switch'); }
    get viewSwitch() { return this.querySelector('.stats-views'); }
    get viewButtons() { return [...this.querySelectorAll('[data-chart-view]')]; }
    get legend() { return this.querySelector('.stats-legend'); }
    get filterControl() { return this.querySelector('.stats-filter'); }
    get filterLabel() { return this.querySelector('.stats-filter span'); }
    get filterInput() { return this.querySelector('[data-filter-toggle]'); }
    get measureControl() { return this.querySelector('.stats-measure'); }
    get measureSelect() { return this.querySelector('[data-measure]'); }
    get controlsRow() { return this.querySelector('.stats-curve-controls'); }
    get typeButtons() { return [...this.querySelectorAll('[data-chart-type]')]; }
    get seriesButtons() { return [...this.querySelectorAll('[data-series]')]; }

    render() { this.innerHTML = html(); }

    bind() {
        this.handleEvents('click', {
            selectType: event => this.selectType(event),
            selectView: event => this.selectView(event),
            selectSeries: event => this.selectSeries(event)
        });
        this.handleEvents('change', {
            filterChanged: () => this.changeOption('filter', this.filterInput.checked),
            measureChanged: () => this.changeOption('measure', this.measureSelect.value)
        });
    }

    changeOption(option, value) {
        this.emit('chart-option-changed', { option, value });
    }

    selectType(event) {
        const button = event.target.closest('[data-chart-type]');
        this.changeOption('type', button.dataset.chartType);
    }

    selectView(event) {
        const button = event.target.closest('[data-chart-view]');
        this.changeOption('view', button.dataset.chartView);
    }

    selectSeries(event) {
        const index = Number(event.target.closest('[data-series]').dataset.series);
        this.changeOption('series', this.model.data.rows[index].id);
    }

    update(model) {
        const focus = this.captureFocus();
        this.model = model;
        this.title.textContent = model.title;
        this.description.textContent = model.definition.description || '';
        this.updateTypeSwitch();
        this.updateViews();
        this.updateLegend();
        this.updateFilter();
        this.updateMeasure();
        this.controlsRow.hidden = !model.definition.filterToggle
            && !this.legend.children.length;
        this.restoreFocus(focus);
    }

    createTypeButton(id) {
        const renderer = this.model.context.registry.getChartType(id);
        if (!renderer || renderer.shape !== this.model.renderer.shape)
            throw new Error(L`Incompatible chart type: ${id}`);
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.chartType = id;
        button.dataset.clickAction = 'selectType';
        button.textContent = renderer.label || id;
        button.setAttribute('aria-pressed', String(id === this.model.type));
        return button;
    }

    updateTypeSwitch() {
        const buttons = (this.model.definition.types || [])
            .map(id => this.createTypeButton(id));
        this.typeSwitch.hidden = !buttons.length;
        this.typeSwitch.replaceChildren(...buttons);
    }

    createViewButton(view) {
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.chartView = view.id;
        button.dataset.clickAction = 'selectView';
        button.textContent = view.label;
        button.setAttribute('aria-pressed', String(view.id === this.model.viewId));
        return button;
    }

    updateViews() {
        const views = this.model.definition.views || [];
        this.viewSwitch.hidden = !views.length;
        this.viewSwitch.replaceChildren(...views.map(view => this.createViewButton(view)));
    }

    createSeriesButton(category, index) {
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.series = index;
        button.dataset.clickAction = 'selectSeries';
        button.style.setProperty('--series-color', category.color
            || 'var(--sl-color-primary-600)');
        button.setAttribute('aria-label', category.label);
        button.setAttribute(
            'aria-pressed', String(!this.model.hiddenSeries.has(category.id))
        );
        button.append(...seriesContent(category));
        const tooltip = document.createElement('sl-tooltip');
        tooltip.content = category.label;
        tooltip.appendChild(button);
        return tooltip;
    }

    updateLegend() {
        const categories = this.visibleCategories();
        this.legend.setAttribute('aria-label', L`Visible ${this.model.data.rowLabel}`);
        this.legend.replaceChildren(...categories
            .map((category, i) => this.createSeriesButton(category, i)));
    }

    visibleCategories() {
        if (this.model.renderer.shape !== 'series' || !this.model.definition.toggleSeries)
            return [];
        return this.model.data.rows;
    }

    updateFilter() {
        this.filterControl.hidden = !this.model.definition.filterToggle;
        this.filterLabel.textContent = this.model.definition.filterToggle?.label || '';
        this.filterInput.checked = Boolean(this.model.filterChecked);
    }

    createMeasureOption(id) {
        const measure = this.model.context.registry.measures.get(id);
        if (!measure) throw new Error(L`Unknown statistics measure: ${id}`);
        const option = document.createElement('option');
        option.value = id;
        option.textContent = measure.label;
        option.selected = id === this.model.definition.measure;
        return option;
    }

    updateMeasure() {
        this.measureControl.hidden = !this.model.definition.measures?.length;
        this.measureSelect.replaceChildren(...(this.model.definition.measures || [])
            .map(id => this.createMeasureOption(id)));
    }

    captureFocus() {
        const focused = document.activeElement;
        if (!this.contains(focused)) return null;
        if (focused.hasAttribute('data-chart-type'))
            return { option: 'type', value: focused.dataset.chartType };
        if (focused.hasAttribute('data-chart-view'))
            return { option: 'view', value: focused.dataset.chartView };
        if (focused.hasAttribute('data-series'))
            return { option: 'series', value: focused.dataset.series };
        if (focused === this.measureSelect) return { option: 'measure' };
        return null;
    }

    restoreFocus(focus) {
        if (!focus) return;
        if (focus.option === 'measure')
            return this.measureSelect.focus({ preventScroll: true });
        const buttons = this.focusButtons(focus.option);
        buttons.find(button => button.dataset.chartType === focus.value
            || button.dataset.chartView === focus.value
            || button.dataset.series === focus.value)?.focus({ preventScroll: true });
    }

    focusButtons(option) {
        const buttons = {
            type: this.typeButtons, view: this.viewButtons, series: this.seriesButtons
        };
        return buttons[option] || [];
    }
}

customElements.define('cm-chart-controls', ChartControls);
