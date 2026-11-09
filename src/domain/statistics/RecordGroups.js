function emptyGroups(categories) {
    return categories.map(() => []);
}

function appendRecord(groups, indices, record) {
    for (const index of indices) groups[index].push(record);
}

export default class RecordGroups {
    constructor(records, rows, columns) {
        this.rowDimension = rows;
        this.columnDimension = columns;
        this.cells = rows.categories.map(() => emptyGroups(columns.categories));
        this.rows = emptyGroups(rows.categories);
        this.columns = emptyGroups(columns.categories);
        this.included = [];
        this.addAll(records);
    }

    addAll(records) {
        for (const [index, record] of records.entries()) {
            this.add(record, this.rowDimension.memberships[index],
                     this.columnDimension.memberships[index]);
        }
    }

    add(record, rows, columns) {
        if (!rows.length || !columns.length) return;
        this.included.push(record);
        this.addRows(record, rows, columns);
        appendRecord(this.columns, columns, record);
    }

    addRows(record, rows, columns) {
        for (const row of rows) {
            this.rows[row].push(record);
            appendRecord(this.cells[row], columns, record);
        }
    }

    records({ row, column } = {}) {
        if (row !== undefined) return this.rowRecords(row, column).slice();
        if (column !== undefined)
            return this.columns[this.columnDimension.indexOf(column)].slice();
        return this.included.slice();
    }

    rowRecords(row, column) {
        const index = this.rowDimension.indexOf(row);
        if (column === undefined) return this.rows[index];
        return this.cells[index][this.columnDimension.indexOf(column)];
    }
}
