const L = localize('statistics');

function categoryIndex(categories) {
    return new Map(categories.map((category, index) => [category.id, index]));
}

function requireIndex(indices, id) {
    if (!indices.has(id)) throw new Error(L`Unknown statistics category: ${id}`);
    return indices.get(id);
}

export default class RecordGroups {
    constructor(rows, columns, groups) {
        this.rows = categoryIndex(rows);
        this.columns = categoryIndex(columns);
        this.groups = groups;
    }

    records({ row, column } = {}) {
        if (row !== undefined) return this.rowRecords(row, column).slice();
        if (column !== undefined)
            return this.groups.columns[requireIndex(this.columns, column)].slice();
        return this.groups.included.slice();
    }

    rowRecords(row, column) {
        const index = requireIndex(this.rows, row);
        if (column === undefined) return this.groups.rows[index];
        return this.groups.cells[index][requireIndex(this.columns, column)];
    }
}
