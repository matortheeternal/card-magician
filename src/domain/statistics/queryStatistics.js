import {
    normalizeStatisticsQuery, validateStatisticsQuery
} from './statisticsQuery.js';
import DimensionData from './DimensionData.js';
import RecordGroups from './RecordGroups.js';
import { aggregateStatistics } from './aggregateStatistics.js';
import { createStatisticsResult } from './statisticsResult.js';

function scopeRecords(records, registry, filterIds) {
    const filters = filterIds.map(id => registry.filters.get(id));
    return records.filter(record => registry.include(record)
        && filters.every(filter => filter.test(record)));
}

export function queryStatistics(records, registry, definition) {
    const query = validateStatisticsQuery(registry, normalizeStatisticsQuery(definition));
    const scoped = scopeRecords(records, registry, query.filters);
    const rows = new DimensionData(registry.dimensions.get(query.rows), scoped);
    const columns = new DimensionData(registry.dimensions.get(query.columns), scoped);
    const groups = new RecordGroups(scoped, rows, columns);
    const measure = registry.measures.get(query.measure);
    const aggregates = aggregateStatistics(groups, registry, measure);
    return createStatisticsResult({
        rows, columns, groups, aggregates, measure, query, scopeCount: scoped.length
    });
}
