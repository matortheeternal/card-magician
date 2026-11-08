import { createMatrix } from './renderers/matrix.js';

const L = localize('statistics');

export default class ChartRenderer {
    constructor(chart) {
        this.chart = chart;
    }

    update(model) {
        this.chart.viewport.classList.toggle('stats-matrix', model.renderer.shape === 'matrix');
        this.chart.viewport.classList.toggle('stats-chart', model.renderer.shape === 'series');
        this.updateDataTable(model);
        this.updateViewport(model);
    }

    updateDataTable(model) {
        if (model.renderer.shape !== 'series') {
            this.chart.dataDetails.hidden = true;
            return;
        }
        this.chart.dataDetails.hidden = false;
        this.chart.dataTable.replaceChildren(createMatrix(model.visibleData, {
            totals: false, title: model.title
        }));
    }

    updateViewport(model) {
        if (model.emptyMessage) return this.showEmpty(model.emptyMessage);
        if (!this.chart.viewport.clientWidth) return;
        const options = {
            definition: model.definition,
            width: Math.max(360, this.chart.viewport.clientWidth),
            context: model.context
        };
        const created = this.ensureRenderer(model.renderer, model.type);
        this.draw(model.visibleData, options, created);
        this.chart.resizePending = false;
    }

    ensureRenderer(renderer, type) {
        if (this.renderer === renderer) return false;
        this.dispose();
        this.chart.viewport.replaceChildren();
        this.renderer = renderer;
        this.instance = renderer.create(this.chart.viewport);
        if (typeof this.instance?.render !== 'function')
            throw new Error(L`Chart renderer ${type} requires a render method`);
        return true;
    }

    draw(data, options, created) {
        if (!created && this.chart.resizePending && this.instance.resize) {
            this.instance.resize(data, options);
            return;
        }
        this.instance.render(data, options);
    }

    showEmpty(text) {
        this.dispose();
        const message = document.createElement('p');
        message.className = 'stats-chart-empty';
        message.textContent = text;
        this.chart.viewport.replaceChildren(message);
    }

    dispose() {
        this.instance?.dispose?.();
        this.instance = null;
        this.renderer = null;
    }
}
