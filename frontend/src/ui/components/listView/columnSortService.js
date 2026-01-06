const toggleSelection = {
    select(col, columns) {
        if (col.sort.direction === 'desc') {
            col.sort.direction = 'asc';
            return;
        }
        const otherSortedCols = columns.filter(c => c !== col && Boolean(c.sort));
        if (otherSortedCols.length === 1) 
            otherSortedCols.forEach(c => (delete c.sort.priority));
        else if (otherSortedCols.length > 1) {
            otherSortedCols
                .filter(c => c.sort.priority > col.sort.priority)
                .forEach(c => (c.sort.priority -= 1));
        }
        delete col.sort;
    }
};

const selectTopPriority = {
    select(col, columns) {
        columns.forEach(c => {
            if (!c.sort) return;
            c.sort.priority = (c.sort.priority || 1) + 1;
        });
        col.sort = { direction: 'desc', priority: 1 };
    }
};

const selectLastPriority = {
    select(col, columns) {
        const priority = columns.reduce((max, c) => {
            if (!c.sort) return max;
            c.sort.priority ||= 1;
            return Math.max(c.sort.priority + 1, max);
        }, 0);
        col.sort = { direction: 'desc', priority };
    }
};

const select = {
    select(col, columns) {
        columns.forEach(c => (delete c.sort));
        col.sort = { direction: 'desc' };
    }
};

export function getColumnSelectMode(column, e) {
    if (column.sort) return toggleSelection;
    if (e.shiftKey) return selectTopPriority;
    if (e.ctrlKey) return selectLastPriority;
    return select;
}
