const L = localize('statistics');

export function requireStatisticsDefinition(collection, id, kind) {
    const definition = collection.get(id);
    if (!definition) throw new Error(L`Unknown statistics ${kind}: ${id}`);
    return definition;
}

export function normalizeChartInput(definition = {}) {
    const { series, x, ...canonical } = definition;
    if (series !== undefined && canonical.rows === undefined) canonical.rows = series;
    if (x !== undefined && canonical.columns === undefined) canonical.columns = x;
    return canonical;
}

export function statisticsIdentifiers(value) {
    if (value === undefined) return [];
    if (!Array.isArray(value) || value.some(id => typeof id !== 'string' || !id))
        throw new Error(L`Statistics identifiers must be an array of nonempty strings`);
    return [...value];
}

function categoryExclusions(ids = []) {
    if (!Array.isArray(ids)) throw new Error(L`Excluded categories must be an array`);
    return [...ids];
}

export function normalizeStatisticsQuery(definition) {
    return {
        rows: definition.rows ?? definition.series,
        columns: definition.columns ?? definition.x,
        measure: definition.measure || 'card-count',
        filters: statisticsIdentifiers(definition.filters),
        excludedColumns: categoryExclusions(definition.excludedColumns),
        sortRows: definition.sortRows,
        limitRows: definition.limitRows
    };
}

export function validateStatisticsQuery(registry, query) {
    requireStatisticsDefinition(registry.dimensions, query.rows, 'dimension');
    requireStatisticsDefinition(registry.dimensions, query.columns, 'dimension');
    const measure = requireStatisticsDefinition(
        registry.measures, query.measure, 'measure'
    );
    if (measure.field)
        requireStatisticsDefinition(registry.fields, measure.field, 'field');
    for (const id of query.filters)
        requireStatisticsDefinition(registry.filters, id, 'filter');
    if (query.sortRows !== undefined
        && !['ascending', 'descending'].includes(query.sortRows))
        throw new Error(L`Row sort must be ascending or descending`);
    if (query.limitRows !== undefined
        && (!Number.isInteger(query.limitRows) || query.limitRows < 1))
        throw new Error(L`Row limit must be a positive integer`);
    return query;
}
