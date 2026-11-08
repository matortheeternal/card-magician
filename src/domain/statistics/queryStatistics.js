function requireDefinition(collection, id, kind) {
    const definition = collection.get(id);
    if (!definition) throw new Error(`Unknown statistics ${kind}: ${id}`);
    return definition;
}

function dimensionData(dimension, records) {
    const values = records.map(record => {
        const result = dimension.values(record);
        if (!Array.isArray(result))
            throw new Error(`Dimension ${dimension.id} must return an array`);
        const ids = result.filter(id => id !== null && id !== undefined);
        if (!ids.length && dimension.missing !== undefined)
            ids.push(dimension.missing);
        return [...new Set(ids)];
    });
    let categories = typeof dimension.categories === 'function'
        ? dimension.categories(records) : dimension.categories;
    if (!categories) {
        categories = [...new Set(values.flat())];
        if (dimension.compare) categories.sort(dimension.compare);
    }
    categories = categories.map(category => typeof category === 'object'
        ? { ...category } : { id: category, label: String(category) });
    const ids = new Set();
    for (const category of categories) {
        if (ids.has(category.id))
            throw new Error(`Duplicate category in ${dimension.id}: ${category.id}`);
        ids.add(category.id);
    }
    return { categories, values: values.map(row => row.filter(id => ids.has(id))) };
}

/** Aggregate prepared records, with each record counted once per group. */
export function queryStatistics(records, registry, definition, shape) {
    const rowId = shape === 'matrix' ? definition.rows : definition.series;
    const columnId = shape === 'matrix' ? definition.columns : definition.x;
    const rowDimension = requireDefinition(registry.dimensions, rowId, 'dimension');
    const columnDimension = requireDefinition(
        registry.dimensions, columnId, 'dimension'
    );
    const measure = requireDefinition(
        registry.measures, definition.measure || 'card-count', 'measure'
    );
    const filters = (definition.filters || []).map(id => (
        requireDefinition(registry.filters, id, 'filter')
    ));
    const scoped = records.filter(record => registry.include(record)
        && filters.every(filter => filter.test(record)));
    const rows = dimensionData(rowDimension, scoped);
    const columns = dimensionData(columnDimension, scoped);
    const rowIndices = new Map(rows.categories.map((category, i) => [category.id, i]));
    const columnIndices = new Map(
        columns.categories.map((category, i) => [category.id, i])
    );
    const groups = rows.categories.map(() => columns.categories.map(() => []));
    const rowGroups = rows.categories.map(() => []);
    const columnGroups = columns.categories.map(() => []);
    const included = [];
    scoped.forEach((record, i) => {
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
    let field;
    if (measure.field)
        field = requireDefinition(registry.fields, measure.field, 'field');
    const reduce = group => {
        const values = field ? group.map(record => field.value(record))
            .filter(value => typeof value === 'number' && Number.isFinite(value))
            : group;
        const value = measure.reduce(values);
        if (value !== null && (typeof value !== 'number' || !Number.isFinite(value)))
            throw new Error(`Measure ${measure.id} returned a non-finite value`);
        return value;
    };
    const cells = groups.map(row => row.map(reduce));
    const rowTotals = rowGroups.map(reduce);
    let order = rows.categories.map((_, i) => i);
    if (definition.sortRows) {
        if (!['ascending', 'descending'].includes(definition.sortRows))
            throw new Error('Row sort must be ascending or descending');
        order.sort((a, b) => {
            if (rowTotals[a] === null) return rowTotals[b] === null ? 0 : 1;
            if (rowTotals[b] === null) return -1;
            const difference = rowTotals[a] - rowTotals[b];
            return (definition.sortRows === 'ascending' ? difference : -difference)
                || rows.categories[a].label.localeCompare(rows.categories[b].label);
        });
    }
    if (definition.limitRows !== undefined) {
        if (!Number.isInteger(definition.limitRows) || definition.limitRows < 1)
            throw new Error('Row limit must be a positive integer');
        order = order.slice(0, definition.limitRows);
    }
    const formatValue = measure.format || (value => value === null ? '—' : String(value));
    return {
        rows: order.map(i => rows.categories[i]), columns: columns.categories,
        cells: order.map(i => cells[i]),
        rowLabel: rowDimension.label, columnLabel: columnDimension.label,
        measureLabel: measure.label, integer: Boolean(measure.integer),
        rowTotals: order.map(i => rowTotals[i]), columnTotals: columnGroups.map(reduce),
        total: reduce(included), cardCount: included.length,
        excludedCount: scoped.length - included.length,
        scopeCount: scoped.length, formatValue,
        describeValue: measure.describe || formatValue,
        labels: columns.categories.map(category => category.label),
        series: order.map(i => ({
            ...rows.categories[i], values: cells[i]
        }))
    };
}
