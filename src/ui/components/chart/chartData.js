import {
    normalizeChartInput
} from '../../../domain/statistics/statisticsQuery.js';
import { resolveChartDefinition } from '../../../domain/statistics/chartDefinition.js';

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

function getDefinition(chart, registry) {
    return {
        ...normalizeChartInput(getReport(registry, chart.getAttribute('report'))),
        ...normalizeChartInput(chart.definition)
    };
}

function getAttributes(chart) {
    const attributes = {};
    for (const name of CHART_ATTRIBUTES) {
        if (name === 'report' || !chart.hasAttribute(name)) continue;
        attributes[name] = chart.getAttribute(name);
    }
    return attributes;
}

function getVisibleData(data, hiddenSeries, shape) {
    if (shape === 'matrix') return data;
    const indices = data.rows.map((_, i) => i)
        .filter(i => !hiddenSeries.has(data.rows[i].id));
    return {
        ...data,
        rows: indices.map(i => data.rows[i]),
        cells: indices.map(i => data.cells[i]),
        rowTotals: indices.map(i => data.rowTotals[i])
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
    const resolved = resolveChartDefinition(registry, getDefinition(chart, registry), {
        type: chart.selectedType, measure: chart.selectedMeasure,
        view: chart.selectedView, filterChecked: chart.filterChecked,
        attributes: getAttributes(chart)
    });
    const { definition, query, type, renderer, viewId } = resolved;
    const data = chart.queryData(records, registry, query);
    const visibleData = getVisibleData(data, chart.hiddenSeries, renderer.shape);
    renderer.validateData?.(visibleData, definition);
    return {
        context: chart.context, definition, type, renderer, data, visibleData,
        title: getTitle(definition, data),
        viewId,
        emptyMessage: getEmptyMessage(visibleData, renderer.shape),
        hiddenSeries: chart.hiddenSeries, filterChecked: chart.filterChecked
    };
}
