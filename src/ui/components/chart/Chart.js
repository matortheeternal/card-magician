import ReactiveComponent from '../ReactiveComponent.js';
import { queryStatistics } from '../../../domain/statistics/queryStatistics.js';
import { categorySymbol } from './categoryLabel.js';
import { createMatrix } from './renderers/matrix.js';
import './renderers/builtins.js';

const attributes = ['type', 'rows', 'columns', 'x', 'series', 'measure', 'report'];

/** Declarative chart, usable inside a workspace or with an explicit context. */
export default class Chart extends ReactiveComponent {
    static observedAttributes = attributes;
    hiddenSeries = new Set();

    get context() {
        return this._context || this.closest('cm-project-stats')?.context;
    }

    /** @param {import('../../../domain/statistics/statisticsTypes.js').StatisticsContext} value */
    set context(value) {
        this._context = value;
        this.requestUpdate();
    }

    get definition() { return this._definition; }

    /** @param {import('../../../domain/statistics/statisticsTypes.js').ChartDefinition} value */
    set definition(value) {
        this._definition = value;
        this.resetOptions();
    }

    attributeChangedCallback() { this.resetOptions(); }

    resetOptions() {
        this.selectedType = null;
        this.filterChecked = undefined;
        this.selectedMeasure = null;
        this.hiddenSeries.clear();
        this.requestUpdate();
    }

    connectedCallback() {
        this.innerHTML = `
            <section class="stats-block">
                <div class="stats-block-header">
                    <div><h2></h2><p class="stats-description"></p></div>
                    <div class="stats-switch" role="group" aria-label="Chart type"></div>
                </div>
                <div class="stats-curve-controls">
                    <div class="stats-legend" role="group"></div>
                    <label class="stats-filter"><input type="checkbox"
                        data-filter-toggle> <span></span></label>
                    <label class="stats-measure">Measure
                        <select data-measure aria-label="Measure"></select>
                    </label>
                </div>
                <div class="stats-render"></div>
                <details class="stats-data"><summary>View chart data</summary>
                    <div class="stats-curve-table stats-matrix"></div>
                </details>
                <p class="stats-chart-error" role="alert" hidden></p>
            </section>`;
        this.on('click', event => {
            const type = event.target.closest('[data-chart-type]');
            const series = event.target.closest('[data-series]');
            if (type) this.selectedType = type.dataset.chartType;
            if (series) {
                const id = this.data.rows[Number(series.dataset.series)].id;
                if (this.hiddenSeries.has(id)) this.hiddenSeries.delete(id);
                else this.hiddenSeries.add(id);
            }
            if (type || series) this.requestUpdate();
        });
        this.on('change', event => {
            if (event.target.matches('[data-filter-toggle]'))
                this.filterChecked = event.target.checked;
            else if (event.target.matches('[data-measure]'))
                this.selectedMeasure = event.target.value;
            else return;
            this.requestUpdate();
        });
        this.resizeObserver = new ResizeObserver(entries => {
            const width = entries[0].contentRect.width;
            if (this.renderWidth === width) return;
            this.renderWidth = width;
            this.resizePending = true;
            this.requestUpdate();
        });
        this.resizeObserver.observe(this.querySelector('.stats-render'));
        this.requestUpdate();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.resizeObserver?.disconnect();
        cancelAnimationFrame(this.frame);
        this.disposeRenderer();
    }

    requestUpdate() {
        if (!this.isConnected) return;
        cancelAnimationFrame(this.frame);
        this.frame = requestAnimationFrame(() => this.update());
    }

    resolveDefinition(registry) {
        const report = this.getAttribute('report');
        if (report && !registry.reports.has(report))
            throw new Error(`Unknown statistics report: ${report}`);
        const definition = { ...registry.reports.get(report), ...this._definition };
        for (const name of attributes) {
            if (name !== 'report' && this.hasAttribute(name))
                definition[name] = this.getAttribute(name);
        }
        return definition;
    }

    update() {
        const context = this.context;
        if (!context || !this.querySelector('.stats-render')) return;
        const focused = this.contains(document.activeElement)
            ? document.activeElement : null;
        const focusType = focused?.getAttribute('data-chart-type');
        const focusSeries = focused?.getAttribute('data-series');
        const focusMeasure = focused?.matches('[data-measure]');
        try {
            this.updateChart(context);
            const selector = focusType !== null && focusType !== undefined
                ? `[data-chart-type="${focusType}"]` : null;
            if (selector) this.querySelector(selector)?.focus({ preventScroll: true });
            if (focusSeries !== null && focusSeries !== undefined) {
                this.querySelector(`[data-series="${focusSeries}"]`)
                    ?.focus({ preventScroll: true });
            }
            if (focusMeasure)
                this.querySelector('[data-measure]').focus({ preventScroll: true });
            this.querySelector('.stats-chart-error').hidden = true;
        } catch (error) {
            this.disposeRenderer();
            this.querySelector('.stats-render').replaceChildren();
            this.querySelector('.stats-data').hidden = true;
            const message = this.querySelector('.stats-chart-error');
            message.textContent = error.message;
            message.hidden = false;
        }
    }

    updateChart({ registry, records }) {
        const definition = this.resolveDefinition(registry);
        definition.measure = this.selectedMeasure || definition.measure;
        const type = this.selectedType || definition.type;
        const renderer = registry.getChartType(type);
        if (!renderer) throw new Error(`Unknown statistics chart type: ${type}`);
        const filters = [...(definition.filters || [])];
        if (definition.filterToggle && !this.filterChecked)
            filters.push(definition.filterToggle.filter);
        this.data = queryStatistics(records, registry, { ...definition, filters },
                                    renderer.shape);
        this.querySelector('h2').textContent = definition.title
            || `${this.data.rowLabel} × ${this.data.columnLabel}`;
        this.querySelector('.stats-description').textContent = definition.description || '';
        this.updateControls(definition, registry, type, renderer.shape);
        const container = this.querySelector('.stats-render');
        container.classList.toggle('stats-matrix', renderer.shape === 'matrix');
        container.classList.toggle('stats-chart', renderer.shape === 'series');
        const visible = this.data.rows.map((row, i) => ({ row, i }))
            .filter(({ row }) => renderer.shape === 'matrix'
                || !this.hiddenSeries.has(row.id));
        const data = {
            ...this.data,
            rows: visible.map(({ row }) => row),
            cells: visible.map(({ i }) => this.data.cells[i]),
            series: visible.map(({ i }) => this.data.series[i])
        };
        const details = this.querySelector('.stats-data');
        details.hidden = renderer.shape !== 'series';
        if (!details.hidden) {
            this.querySelector('.stats-curve-table').replaceChildren(
                createMatrix(data, { totals: false, title: definition.title })
            );
        }
        if (renderer.shape === 'series' && (!data.rows.length || !data.cardCount)) {
            this.disposeRenderer();
            const message = document.createElement('p');
            message.className = 'stats-chart-empty';
            message.textContent = !data.rows.length
                ? 'Select a series to show its data.' : 'No cards to plot in this scope.';
            container.replaceChildren(message);
            return;
        }
        if (container.clientWidth === 0) return;
        const options = {
            definition, width: Math.max(360, container.clientWidth), context: this.context
        };
        const newRenderer = this.renderer !== renderer;
        if (newRenderer) {
            this.disposeRenderer();
            container.replaceChildren();
            this.renderer = renderer;
            this.rendererInstance = renderer.create(container);
            if (typeof this.rendererInstance?.render !== 'function')
                throw new Error(`Chart renderer ${type} requires a render method`);
        }
        if (!newRenderer && this.resizePending && this.rendererInstance.resize)
            this.rendererInstance.resize(data, options);
        else this.rendererInstance.render(data, options);
        this.resizePending = false;
    }

    updateControls(definition, registry, type, shape) {
        const switches = this.querySelector('.stats-switch');
        switches.replaceChildren();
        for (const id of definition.types || []) {
            const chartType = registry.getChartType(id);
            if (!chartType || chartType.shape !== shape)
                throw new Error(`Incompatible chart type: ${id}`);
            const button = document.createElement('button');
            button.type = 'button';
            button.dataset.chartType = id;
            button.textContent = chartType.label || id;
            button.setAttribute('aria-pressed', String(id === type));
            switches.appendChild(button);
        }
        const legend = this.querySelector('.stats-legend');
        legend.replaceChildren();
        legend.setAttribute('aria-label', `Visible ${this.data.rowLabel}`);
        if (shape === 'series' && definition.toggleSeries) {
            this.data.rows.forEach((category, i) => {
                const button = document.createElement('button');
                button.type = 'button';
                button.dataset.series = i;
                button.style.setProperty('--series-color', category.color
                    || 'var(--sl-color-primary-600)');
                button.setAttribute('aria-label', category.label);
                button.setAttribute('aria-pressed',
                                    String(!this.hiddenSeries.has(category.id)));
                if (category.icon) button.appendChild(categorySymbol(category));
                else button.textContent = category.label;
                const tooltip = document.createElement('sl-tooltip');
                tooltip.content = category.label;
                tooltip.appendChild(button);
                legend.appendChild(tooltip);
            });
        }
        const filter = this.querySelector('.stats-filter');
        filter.hidden = !definition.filterToggle;
        filter.querySelector('span').textContent = definition.filterToggle?.label || '';
        filter.querySelector('input').checked = Boolean(this.filterChecked);
        const measureControl = this.querySelector('.stats-measure');
        measureControl.hidden = !definition.measures?.length;
        const select = measureControl.querySelector('select');
        select.replaceChildren();
        for (const id of definition.measures || []) {
            const measure = registry.measures.get(id);
            if (!measure) throw new Error(`Unknown statistics measure: ${id}`);
            const option = document.createElement('option');
            option.value = id;
            option.textContent = measure.label;
            option.selected = id === definition.measure;
            select.appendChild(option);
        }
        this.querySelector('.stats-curve-controls').hidden =
            !definition.filterToggle && !legend.children.length && measureControl.hidden;
    }

    disposeRenderer() {
        this.rendererInstance?.dispose?.();
        this.rendererInstance = null;
        this.renderer = null;
    }
}

customElements.define('cm-chart', Chart);
