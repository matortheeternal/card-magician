function selectRows(data, indices) {
    return {
        ...data,
        rows: indices.map(i => data.rows[i]),
        cells: indices.map(i => data.cells[i]),
        rowTotals: indices.map(i => data.rowTotals[i])
    };
}

function filteredChartData(chart, source, query, axis) {
    if (axis !== 'columns' || !chart.hiddenSeries.size) return source;
    const { records, registry } = chart.context;
    return chart.queryData(records, registry, {
        ...query, excludedColumns: [...query.excludedColumns, ...chart.hiddenSeries]
    }, 'filtered');
}

function visibleChartRows(data, hiddenSeries, axis) {
    if (!hiddenSeries.size) return data;
    const indices = data.rows.map((_, i) => i);
    if (axis === 'rows')
        return selectRows(data, indices.filter(i => !hiddenSeries.has(data.rows[i].id)));
    return selectRows(data, indices.filter(i => (
        data.getRecords({ row: data.rows[i].id }).length > 0
    )));
}

function limitChartRows(data, limit, expanded) {
    if (!limit || expanded) return data;
    return selectRows(data, data.rows.map((_, i) => i).slice(0, limit));
}

export function createChartVisibility(chart, source, query, definition) {
    const seriesAxis = definition.seriesAxis || 'rows';
    const data = filteredChartData(chart, source, query, seriesAxis);
    const rows = visibleChartRows(data, chart.hiddenSeries, seriesAxis);
    const visibleData = limitChartRows(rows, definition.displayLimit, chart.showAllRows);
    const seriesLabel = seriesAxis === 'rows' ? source.rowLabel : source.columnLabel;
    return {
        data, visibleData, seriesAxis, seriesLabel,
        seriesCategories: definition.toggleSeries ? source[seriesAxis] : [],
        rowCount: rows.rows.length, expanded: chart.showAllRows
    };
}
