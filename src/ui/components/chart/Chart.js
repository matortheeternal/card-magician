import { chartSelectionLabel } from './chartSelection.js';
import { queryStatistics } from '../../../domain/statistics/queryStatistics.js';
import ReactiveComponent from '../ReactiveComponent.js';
import { CHART_ATTRIBUTES, createChartModel } from './chartData.js';
import ChartRenderer from './ChartRenderer.js';
import html from './chart.html.js';
import './ChartControls.js';
import './renderers/builtins.js';

export default class Chart extends ReactiveComponent {
    static observedAttributes = [...CHART_ATTRIBUTES, 'selectable'];
    hiddenSeries = new Set();
    optionHandlers = {
        type: value => { this.selectedType = value; },
        measure: value => { this.selectedMeasure = value; },
        view: value => { this.selectedView = value; },
        filter: value => { this.filterChecked = value; },
        series: value => this.toggleSeries(value),
        rows: value => { this.showAllRows = value; }
    };

    get workspace() { return this.closest('cm-project-stats'); }
    get isSelectable() {
        return this.hasAttribute('selectable') || Boolean(this.workspace);
    }
    get controls() { return this.querySelector('cm-chart-controls'); }
    get viewport() { return this.querySelector('.stats-render'); }
    get dataDetails() { return this.querySelector('.stats-data'); }
    get dataTable() { return this.querySelector('.stats-curve-table'); }
    get errorMessage() { return this.querySelector('.stats-chart-error'); }
    get context() { return this._context || this.workspace?.context; }
    get definition() { return this._definition; }

    set context(value) {
        this._context = value;
        this.requestUpdate();
    }

    set definition(value) {
        this._definition = value;
        this.resetOptions();
    }

    connectedCallback() {
        this.render();
        this.rendererHost = new ChartRenderer(this);
        this.bind();
        this.requestUpdate();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.resizeObserver?.disconnect();
        cancelAnimationFrame(this.frame);
        this.rendererHost?.dispose();
        this.queryCache = null;
    }

    attributeChangedCallback(name) {
        if (name === 'selectable') return this.requestUpdate(false);
        this.resetOptions();
    }

    render() { this.innerHTML = html(); }

    bind() {
        this.on('chart-option-changed', event => this.onControlChanged(event));
        this.resizeObserver = new ResizeObserver(entries => this.onResize(entries[0]));
        this.resizeObserver.observe(this.viewport);
    }

    onResize(entry) {
        if (entry.contentRect.width === this.renderWidth) return;
        this.renderWidth = entry.contentRect.width;
        this.resizePending = true;
        this.requestUpdate(false);
    }

    onOptionChanged({ option, value }) {
        this.optionHandlers[option]?.(value);
        this.requestUpdate(false);
    }

    onControlChanged(event) {
        if (event.target !== this.controls) return;
        event.stopPropagation();
        this.onOptionChanged(event.detail);
    }

    toggleSeries(id) {
        if (this.hiddenSeries.has(id)) { this.hiddenSeries.delete(id); return; }
        this.hiddenSeries.add(id);
    }

    resetOptions() {
        this.selectedType = null;
        this.selectedMeasure = null;
        this.selectedView = null;
        this.filterChecked = undefined;
        this.hiddenSeries.clear();
        this.showAllRows = false;
        this.requestUpdate(false);
    }

    queryData(records, registry, query, slot = 'source') {
        const key = JSON.stringify(query);
        this.queryCache ||= {};
        const previous = this.queryCache[slot];
        if (previous?.records === records && previous.registry === registry
            && previous.key === key) return previous.data;
        const data = queryStatistics(records, registry, query);
        this.queryCache[slot] = { records, registry, key, data };
        return data;
    }

    activateSelection(selection, data = this.data, context = this.context) {
        const records = data.getRecords(selection);
        const cards = [...new Set(records.map(record => (
            context.registry.cardForRecord(record)
        )))];
        this.emit('chart-selection', {
            selection, records, cards, project: context.project,
            title: this.controls.title.textContent,
            label: chartSelectionLabel(data, selection)
        });
    }

    requestUpdate(invalidateQuery = true) {
        if (invalidateQuery) this.queryCache = null;
        if (!this.isConnected) return;
        cancelAnimationFrame(this.frame);
        this.frame = requestAnimationFrame(() => this.update());
    }

    update() {
        if (!this.context || !this.rendererHost) return;
        try {
            const model = createChartModel(this);
            this.data = model.data;
            this.controls.update(model);
            this.rendererHost.update(model);
            this.errorMessage.hidden = true;
        } catch (error) {
            this.showError(error);
        }
    }

    showError(error) {
        this.rendererHost.dispose();
        this.viewport.replaceChildren();
        this.dataDetails.hidden = true;
        this.errorMessage.textContent = error.message;
        this.errorMessage.hidden = false;
    }
}

customElements.define('cm-chart', Chart);
