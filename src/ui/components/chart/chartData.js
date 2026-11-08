import { queryStatistics } from '../../../domain/statistics/queryStatistics.js';

export const CHART_ATTRIBUTES = [
    'type', 'rows', 'columns', 'x', 'series', 'measure', 'report'
];

const L = localize('statistics');

function getReport(registry, id) {
    if (!id) return {};
    if (!registry.reports.has(id))
        throw new Error(L`Unknown statistics report: ${id}`);
    return registry.reports.get(id);
}

function resolveDefinition(chart, registry) {
    const definition = {
        ...getReport(registry, chart.getAttribute('report')), ...chart.definition
    };
    for (const name of CHART_ATTRIBUTES) {
        if (name === 'report' || !chart.hasAttribute(name)) continue;
        definition[name] = chart.getAttribute(name);
    }
    definition.measure = chart.selectedMeasure || definition.measure;
    return definition;
}

function resolveFilters(definition, checked) {
    const filters = [...(definition.filters || [])];
    if (definition.filterToggle && !checked)
        filters.push(definition.filterToggle.filter);
    return filters;
}

function resolveRenderer(registry, type) {
    const renderer = registry.getChartType(type);
    if (!renderer) throw new Error(L`Unknown statistics chart type: ${type}`);
    return renderer;
}

function getVisibleData(data, hiddenSeries, shape) {
    if (shape === 'matrix') return data;
    const indices = data.rows.map((_, i) => i)
        .filter(i => !hiddenSeries.has(data.rows[i].id));
    return {
        ...data,
        rows: indices.map(i => data.rows[i]),
        cells: indices.map(i => data.cells[i]),
        rowTotals: indices.map(i => data.rowTotals[i]),
        series: indices.map(i => data.series[i])
    };
}

function getEmptyMessage(data, shape) {
    if (shape !== 'series') return '';
    if (!data.rows.length) return L`Select a series to show its data.`;
    if (!data.cardCount) return L`No cards to plot in this scope.`;
    return '';
}

function getTitle(definition, data) {
    if (definition.title) return definition.title;
    return L`${data.rowLabel} × ${data.columnLabel}`;
}

export function createChartModel(chart) {
    const { registry, records } = chart.context;
    const definition = resolveDefinition(chart, registry);
    const type = chart.selectedType || definition.type;
    const renderer = resolveRenderer(registry, type);
    const filters = resolveFilters(definition, chart.filterChecked);
    const data = queryStatistics(records, registry, { ...definition, filters },
                                 renderer.shape);
    const visibleData = getVisibleData(data, chart.hiddenSeries, renderer.shape);
    return {
        context: chart.context, definition, type, renderer, data, visibleData,
        title: getTitle(definition, data),
        emptyMessage: getEmptyMessage(visibleData, renderer.shape),
        hiddenSeries: chart.hiddenSeries, filterChecked: chart.filterChecked
    };
}
