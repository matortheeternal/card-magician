function selectRangeTo(rows, targetRow, multiSelect) {
    let select = false;
    rows.forEach(row => {
        const isTargetRow = row === targetRow;
        const rowInRange = row.lastSelected || isTargetRow;
        if (rowInRange) select = !select;
        row.selected = rowInRange || select || (multiSelect && row.selected);
        row.lastSelected = isTargetRow;
    });
}

function selectAdditionalRow(rows, targetRow) {
    targetRow.selected = !targetRow.selected;
    rows.forEach(row => (row.lastSelected = row === targetRow));
}

function selectSingleRow(rows, targetRow) {
    rows.forEach(row => {
        const isTargetRow = row === targetRow;
        row.lastSelected = isTargetRow;
        row.selected = isTargetRow;
    });
}

function hasLastSelectedRow(rows) {
    return rows.some(row => row.lastSelected);
}

export function selectRow(rows, row, multiSelect, rangeSelect) {
    if (rangeSelect && hasLastSelectedRow(rows))
        return selectRangeTo(rows, row, multiSelect);
    if (multiSelect)
        return selectAdditionalRow(rows, row);
    selectSingleRow(rows, row);
}
