import { requireStatisticsDefinition } from './statisticsQuery.js';

const L = localize('statistics');

function getMeasureField(registry, measure) {
    if (!measure.field) return null;
    return requireStatisticsDefinition(registry.fields, measure.field, 'field');
}

function measureValues(group, field) {
    if (!field) return group;
    return group.map(record => field.value(record))
        .filter(value => typeof value === 'number' && Number.isFinite(value));
}

function createReducer(registry, measure) {
    const field = getMeasureField(registry, measure);
    return group => {
        const value = measure.reduce(measureValues(group, field));
        if (value !== null && (typeof value !== 'number' || !Number.isFinite(value)))
            throw new Error(L`Measure ${measure.id} returned a non-finite value`);
        return value;
    };
}

export function aggregateStatistics(groups, registry, measure) {
    const reduce = createReducer(registry, measure);
    return {
        cells: groups.cells.map(row => row.map(reduce)),
        rowTotals: groups.rows.map(reduce),
        columnTotals: groups.columns.map(reduce),
        total: reduce(groups.included)
    };
}
