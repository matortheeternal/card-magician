import {
    normalizeStatisticsQuery, validateStatisticsQuery,
    requireStatisticsDefinition as requireDefinition
} from './statisticsQuery.js';
import RecordGroups from './RecordGroups.js';

const L = localize('statistics');

function normalizeCategory(category) {
    if (typeof category === 'object') return { ...category };
    return { id: category, label: String(category) };
}

function getCategories(dimension, records, values) {
    if (typeof dimension.categories === 'function') return dimension.categories(records);
    if (dimension.categories) return dimension.categories;
    const categories = [...new Set(values.flat())];
    if (dimension.compare) categories.sort(dimension.compare);
    return categories;
}

function dimensionData(dimension, records) {
    const values = records.map(record => {
        const result = dimension.values(record);
        if (!Array.isArray(result))
            throw new Error(L`Dimension ${dimension.id} must return an array`);
        const ids = result.filter(id => id !== null && id !== undefined);
        if (!ids.length && dimension.missing !== undefined)
            ids.push(dimension.missing);
        return [...new Set(ids)];
    });
    const categories = getCategories(dimension, records, values).map(normalizeCategory);
    const ids = new Set();
    for (const category of categories) {
        if (ids.has(category.id))
            throw new Error(L`Duplicate category in ${dimension.id}: ${category.id}`);
        ids.add(category.id);
    }
    return { categories, values: values.map(row => row.filter(id => ids.has(id))) };
}

function groupRecords(records, rows, columns) {
    const rowIndices = new Map(rows.categories.map((category, i) => [category.id, i]));
    const columnIndices = new Map(
        columns.categories.map((category, i) => [category.id, i])
    );
    const groups = rows.categories.map(() => columns.categories.map(() => []));
    const rowGroups = rows.categories.map(() => []);
    const columnGroups = columns.categories.map(() => []);
    const included = [];
    records.forEach((record, i) => {
        if (!rows.values[i].length || !columns.values[i].length) return;
        included.push(record);
        for (const row of rows.values[i]) {
            const r = rowIndices.get(row);
            rowGroups[r].push(record);
            for (const column of columns.values[i])
                groups[r][columnIndices.get(column)].push(record);
        }
        for (const column of columns.values[i])
            columnGroups[columnIndices.get(column)].push(record);
    });
    return { cells: groups, rows: rowGroups, columns: columnGroups, included };
}

function getMeasureField(registry, measure) {
    if (!measure.field) return null;
    return requireDefinition(registry.fields, measure.field, 'field');
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

function compareRows(a, b, categories, rowTotals, direction) {
    if (rowTotals[a] === null && rowTotals[b] === null) return 0;
    if (rowTotals[a] === null) return 1;
    if (rowTotals[b] === null) return -1;
    return direction * (rowTotals[a] - rowTotals[b])
        || categories[a].label.localeCompare(categories[b].label);
}

function sortRows(categories, rowTotals, sort) {
    const order = categories.map((_, i) => i);
    if (!sort) return order;
    const direction = sort === 'ascending' ? 1 : -1;
    return order.sort((a, b) => compareRows(a, b, categories, rowTotals, direction));
}

function getRowOrder(categories, rowTotals, query) {
    const order = sortRows(categories, rowTotals, query.sortRows);
    if (query.limitRows === undefined) return order;
    return order.slice(0, query.limitRows);
}

function formatNumber(value) {
    if (value === null) return '—';
    return String(value);
}

export function queryStatistics(records, registry, definition) {
    const query = validateStatisticsQuery(registry, normalizeStatisticsQuery(definition));
    const { rows: rowId, columns: columnId } = query;
    const rowDimension = requireDefinition(registry.dimensions, rowId, 'dimension');
    const columnDimension = requireDefinition(
        registry.dimensions, columnId, 'dimension'
    );
    const measure = requireDefinition(
        registry.measures, query.measure, 'measure'
    );
    const filters = query.filters.map(id => (
        requireDefinition(registry.filters, id, 'filter')
    ));
    const scoped = records.filter(record => registry.include(record)
        && filters.every(filter => filter.test(record)));
    const rows = dimensionData(rowDimension, scoped);
    const columns = dimensionData(columnDimension, scoped);
    const groups = groupRecords(scoped, rows, columns);
    const reduce = createReducer(registry, measure);
    const cells = groups.cells.map(row => row.map(reduce));
    const rowTotals = groups.rows.map(reduce);
    const order = getRowOrder(rows.categories, rowTotals, query);
    const formatValue = measure.format || formatNumber;
    const membership = new RecordGroups(rows.categories, columns.categories, groups);
    return {
        getRecords: selection => membership.records(selection),
        rows: order.map(i => rows.categories[i]), columns: columns.categories,
        cells: order.map(i => cells[i]),
        rowLabel: rowDimension.label, columnLabel: columnDimension.label,
        measureLabel: measure.label, integer: Boolean(measure.integer),
        rowTotals: order.map(i => rowTotals[i]), columnTotals: groups.columns.map(reduce),
        total: reduce(groups.included), cardCount: groups.included.length,
        excludedCount: scoped.length - groups.included.length,
        scopeCount: scoped.length, formatValue,
        describeValue: measure.describe || formatValue
    };
}
