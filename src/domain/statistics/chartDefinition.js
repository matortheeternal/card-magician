import {
    normalizeStatisticsQuery, validateStatisticsQuery, requireStatisticsDefinition,
    normalizeChartInput, statisticsIdentifiers
} from './statisticsQuery.js';

const L = localize('statistics');

export function requireChartRenderer(registry, type) {
    const renderer = registry.getChartType(type);
    if (!renderer) throw new Error(L`Unknown statistics chart type: ${type}`);
    return renderer;
}

function validateOptions(registry, definition) {
    for (const id of statisticsIdentifiers(definition.measures))
        requireStatisticsDefinition(registry.measures, id, 'measure');
    if (definition.filterToggle) {
        requireStatisticsDefinition(
            registry.filters, definition.filterToggle.filter, 'filter'
        );
    }
    for (const id of statisticsIdentifiers(definition.types)) {
        const renderer = requireChartRenderer(registry, id);
        renderer.validateDefinition?.({ ...definition, type: id }, registry);
    }
}

function resolveView(definition, selected) {
    const views = definition.views || [];
    const ids = new Set();
    for (const view of views) {
        if (!view.id || ids.has(view.id))
            throw new Error(L`Duplicate or empty statistics view: ${view.id}`);
        ids.add(view.id);
    }
    if (!views.length) return null;
    const id = selected || views[0].id;
    const view = views.find(option => option.id === id);
    if (!view) throw new Error(L`Unknown statistics view: ${id}`);
    return view;
}

function effectiveDefinition(definition, state, view) {
    const effective = {
        ...normalizeChartInput(definition),
        ...normalizeChartInput(view?.definition),
        ...normalizeChartInput(state.attributes)
    };
    effective.type = state.type || effective.type;
    effective.measure = state.measure || effective.measure;
    effective.filters = statisticsIdentifiers(effective.filters);
    if (effective.filterToggle && !state.filterChecked)
        effective.filters.push(effective.filterToggle.filter);
    return effective;
}

export function resolveChartDefinition(registry, definition, state = {}) {
    const view = resolveView(definition, state.view);
    const effective = effectiveDefinition(definition, state, view);
    const query = validateStatisticsQuery(registry, normalizeStatisticsQuery(effective));
    const resolved = { ...effective, ...query };
    const renderer = requireChartRenderer(registry, resolved.type);
    validateOptions(registry, resolved);
    renderer.validateDefinition?.(resolved, registry);
    return {
        query, definition: resolved, renderer, type: resolved.type, viewId: view?.id
    };
}
