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

export function getActiveRow(rows) {
    return rows.find(row => row.lastSelected) || rows.filter(row => row.selected).at(-1);
}

function getPreviousSurvivor(oldRows, active, rowMap) {
    const index = oldRows.indexOf(active);
    const previous = oldRows.slice(0, index).reverse();
    const following = oldRows.slice(index + 1);
    const survivor = [...previous, ...following].find(row => rowMap.has(row.original));
    return rowMap.get(survivor?.original);
}

export function updateRowSelection(rows, oldRowMap, addedRow) {
    if (addedRow) return selectSingleRow(rows, addedRow);
    const oldRows = [...oldRowMap.values()];
    const active = getActiveRow(oldRows);
    if (!active) return;
    const rowMap = new Map(rows.map(row => [row.original, row]));
    if (rowMap.has(active.original)) return;
    const survivingSelection = rows.filter(row => row.selected);
    const candidates = survivingSelection.length ? survivingSelection : rows;
    const candidateMap = new Map(candidates.map(row => [row.original, row]));
    const next = getPreviousSurvivor(oldRows, active, candidateMap);
    if (!next) return;
    if (!survivingSelection.length) return selectSingleRow(rows, next);
    next.lastSelected = true;
}
