import { createChartVisibility } from './chartVisibility.js';
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

function getEmptyMessage(data, shape, seriesAxis, toggleSeries) {
    if (toggleSeries && !data[seriesAxis].length)
        return L`Select a series to show its data.`;
    if (!data.cardCount && (shape === 'series' || toggleSeries))
        return L`No cards to plot in this scope.`;
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
    const source = chart.queryData(records, registry, query);
    const visibility = createChartVisibility(chart, source, query, definition);
    const { data, visibleData, seriesAxis } = visibility;
    renderer.validateData?.(visibleData, definition);
    return {
        context: chart.context, definition, type, renderer, ...visibility,
        title: getTitle(definition, data),
        viewId,
        emptyMessage: getEmptyMessage(visibleData, renderer.shape,
                                      seriesAxis, definition.toggleSeries),
        hiddenSeries: chart.hiddenSeries, filterChecked: chart.filterChecked
    };
}
