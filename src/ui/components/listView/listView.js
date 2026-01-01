import ReactiveComponent from '../ReactiveComponent.js';
import { getColumnSelectMode } from './columnSortService.js';
import { selectRow } from './rowSelectionService.js';
import { emit } from '../../../shared/htmlUtils.js';

const L = localize('list-view');

function makeDefaultDisplayFunction(column) {
    return (row) => `${row.data[column.id]}`;
}

export default class ListView extends ReactiveComponent {
    #columns = [];
    #rows = [];
    activeRows = [];
    activeColumns = [];

    connectedCallback() {
        this.handleEvents('click', { addRowClick: this.addRowClick });
        if (this.#rows && this.#columns) this.render();
    }

    get rows() {
        return this.#rows;
    }

    set rows(newValue) {
        this.#rows = newValue;
        this.computeRows();
        if (this.#rows && this.#columns) this.render();
    }

    get columns() {
        return this.#columns;
    }

    set columns(newValue) {
        this.#columns = newValue;
        this.computeColumns();
        if (this.#rows && this.#columns) this.render();
    }

    get selection() {
        return this.activeRows.filter(r => r.selected);
    }

    set selection(indexesToSelect) {
        const maxIndex = Math.max.apply(null, indexesToSelect);
        for (let i = 0; i < this.activeRows.length; i++) {
            this.activeRows[i].lastSelected = i === maxIndex;
            this.activeRows[i].selected = indexesToSelect.includes(i);
        }
    }

    computeColumns() {
        this.activeColumns = this.columns.map(col => {
            const active = { ...col };
            if (!active.id) active.id = col.label.normalizeWords().toCamelCase();
            if (!active.display) active.display = makeDefaultDisplayFunction(active);
            return active;
        });
    }

    computeRows() {
        const oldRowMap = new Map((this.activeRows || []).map(r => [r.original, r]));
        this.activeRows = this.rows.map(row => {
            const cols = this.activeColumns || [];
            const data = cols.reduce((obj, col) => {
                obj[col.id] = col.data(row);
                return obj;
            }, {});
            const oldRow = oldRowMap.get(row);
            return {
                data,
                selected: oldRow?.selected || false,
                lastSelected: oldRow?.lastSelected || false,
                original: row
            };
        });
        this.sortRows();
    }

    defaultCompare(col, a, b) {
        const aData = a.data[col.id];
        const bData = b.data[col.id];
        return aData.localeCompare(bData);
    }

    sortRows() {
        const sortCols = this.activeColumns
            .filter(col => Boolean(col.sort))
            .sort((a, b) => a.sort.priority - b.sort.priority);
        if (!sortCols.length) return;
        this.activeRows.sort((a, b) => {
            for (const col of sortCols) {
                const diff = col.compare
                    ? col.compare(a, b)
                    : this.defaultCompare(col, a, b);
                if (!diff) continue;
                return col.sort.direction === 'asc' ? -diff : diff;
            }
            return 0;
        });
    }

    get addRowLabel() {
        return this.getAttribute('add-row-label')
            || L`Click to add a row`;
    }

    get addRow() {
        return this.querySelector('.add-row');
    }

    get colGroup() {
        return this.querySelector('colgroup');
    }

    get thead() {
        return this.querySelector('thead');
    }

    get tbody() {
        return this.querySelector('tbody');
    }

    generateIconWithTooltip(content, iconName) {
        const tooltip = document.createElement('sl-tooltip');
        tooltip.hoist = true;
        tooltip.placement = 'bottom';
        tooltip.content = content;

        const icon = document.createElement('sl-icon');
        icon.name = iconName;
        tooltip.appendChild(icon);

        return tooltip;
    }

    renderSort(th, sort) {
        const sortContainer = document.createElement('div');
        sortContainer.classList.add('column-sort');
        if (sort.priority) {
            this.generateIconWithTooltip(
                sortContainer,
                `Sort Priority ${sort.priority}`,
                `${sort.priority || '0'}-circle-fill`
            );
        }
        const isAscending = sort.direction === 'asc';
        const sortOrderLabel = isAscending ? 'ascending' : 'descending';
        this.generateIconWithTooltip(
            sortContainer,
            `Sorted in ${sortOrderLabel} order`,
            isAscending ? 'arrow-up' : 'arrow-down'
        );
        th.appendChild(sortContainer);
    }

    generateResizeHandle(index) {
        const resizeHandle = document.createElement('div');
        resizeHandle.classList.add('resize-handle');
        resizeHandle.addEventListener('mousedown', event => {
            this.onResizeMouseDown(event, index);
        });
        return resizeHandle;
    }

    generateHeaderCell(col, index) {
        const th = document.createElement('th');
        th.addEventListener('click', event => this.onHeaderClick(event, col));
        th.appendChild(document.createTextNode(col.label));
        if (col.sort) this.renderSort(th, col.sort);
        th.appendChild(this.generateResizeHandle(index));
        return th;
    }

    renderColumns() {
        this.colGroup.innerHTML = this.activeColumns
            .map(col => `<col style="width:${col.width || 'auto'}">`)
            .join('');
        const headerRow = document.createElement('tr');
        this.activeColumns.forEach((col, index) => {
            headerRow.appendChild(this.generateHeaderCell(col, index));
        });
        this.thead.appendChild(headerRow);
    }

    renderRows() {
        this.tbody.innerHTML = '';
        this.activeRows.forEach(row => {
            const rowElement = document.createElement('tr');
            rowElement.addEventListener('click', event => this.onRowClick(event, row));
            this.activeColumns.forEach(col => {
                const cell = document.createElement('td');
                cell.innerHTML = col.display(row);
                rowElement.appendChild(cell);
            });
            this.tbody.appendChild(rowElement);
        });
        this.updateSelectedClasses();
    }

    renderAddRowLabel() {
        this.addRow.textContent = this.addRowLabel;
    }

    render() {
        this.innerHTML = (
            `<table class="list-view-table">
                <colgroup></colgroup>
                <thead></thead>
                <tbody></tbody>
            </table>
            <div class="add-row" data-click-action="addRowClick"></div>`
        );
        if (this.activeRows.length === 0) return;
        this.renderColumns();
        this.renderRows();
        this.renderAddRowLabel();
    }

    updateSelectedClasses() {
        this.tbody.querySelectorAll('tr').forEach((rowElement, index) => {
            const row = this.activeRows[index];
            rowElement.className = '';
            if (row.selected) rowElement.classList.add('selected');
            if (row.lastSelected) rowElement.classList.add('last-selected');
        });
    }

    onHeaderClick(event, column) {
        event.stopImmediatePropagation();
        const mode = getColumnSelectMode(column, event);
        mode.select(column, this.activeColumns);
        this.sortRows();
        this.render();
    }

    onResizeMouseDown(event, colIndex) {
        event.stopImmediatePropagation();

        document.body.classList.add('column-resizing');
        const column = this.colGroup.children[colIndex];
        const startX = event.clientX;
        const startWidth = event.target.parentNode.offsetWidth;

        function onMouseMove(moveEvent) {
            const delta = moveEvent.clientX - startX;
            const newWidth = Math.max(40, startWidth + delta);
            column.style.width = newWidth + 'px';
        }

        function onMouseUp() {
            document.body.classList.remove('column-resizing');
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        }

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    }

    onRowClick(event, row) {
        const multiSelect = event.ctrlKey;
        const rangeSelect = event.shiftKey;
        selectRow(this.activeRows, row, multiSelect, rangeSelect);
        this.updateSelectedClasses();
        emit(this, 'row-selected', { row });
    }

    addRowClick() {
        emit(this, 'add-row-click');
    }
}

customElements.define('cm-list-view', ListView);
