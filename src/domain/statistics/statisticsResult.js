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

function measurePresentation(measure) {
    const formatValue = measure.format || formatNumber;
    return {
        measureLabel: measure.label,
        integer: Boolean(measure.integer),
        formatValue,
        describeValue: measure.describe || formatValue
    };
}

function selectRows(categories, aggregates, query) {
    const order = getRowOrder(categories, aggregates.rowTotals, query);
    return {
        rows: order.map(i => categories[i]),
        cells: order.map(i => aggregates.cells[i]),
        rowTotals: order.map(i => aggregates.rowTotals[i])
    };
}

function scopeSummary(scopeCount, cardCount) {
    return { scopeCount, cardCount, excludedCount: scopeCount - cardCount };
}

export function createStatisticsResult({ rows, columns, groups, aggregates,
    measure, query, scopeCount }) {
    return {
        ...aggregates,
        ...selectRows(rows.categories, aggregates, query),
        ...measurePresentation(measure),
        ...scopeSummary(scopeCount, groups.included.length),
        columns: columns.categories,
        rowLabel: rows.label,
        columnLabel: columns.label,
        getRecords: selection => groups.records(selection)
    };
}
