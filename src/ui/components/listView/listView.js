import Alpine from 'alpinejs';
import { emit } from '../../../shared/htmlUtils.js';
import { selectRow } from './rowSelectionService.js';
import { registerAction } from '../../systems/actionSystem.js';
import html from './listView.html';
import { getColumnSelectMode } from './columnSortService.js';

const L = localize('list-view');

function makeDefaultDisplayFunction(column) {
    return (row) => `<span>${row.data[column.id]}</span>`;
}

Alpine.data('listView', (config) => ({
    columns: config.columns || [],
    rows: config.rows || [],
    addRowLabel: config.addRowLabel || L`Click to add a row`,
    activeColumns: [],
    activeRows: [],

    async init() {
        this.$watch('columns', () => this.computeColumns());
        this.$watch('rows', () => this.computeRows());
        this.$watch('activeColumns', () => this.computeRows());
        this.$watch('columns', () => this.updateColumnSizes());

        this.computeColumns();
        this.computeRows();
        this.bindEvents();

        this.$root.innerHTML = html;
        Alpine.initTree(this.$root);

        this.updateColumnSizes();
    },

    computeColumns() {
        this.activeColumns = this.columns.map(col => {
            const active = { ...col };
            if (!active.id) active.id = col.label.normalizeWords().toCamelCase();
            if (!active.display) active.display = makeDefaultDisplayFunction(active);
            return active;
        });
    },

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
    },

    defaultCompare(col, a, b) {
        const aData = a.data[col.id];
        const bData = b.data[col.id];
        return aData.localeCompare(bData);
    },

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
    },

    bindEvents() {
        registerAction('get-listview-selection', () => {
            return this.activeRows.filter(r => r.selected);
        });
        registerAction('set-listview-selection', (indexesToSelect) => {
            const maxIndex = Math.max.apply(null, indexesToSelect);
            for (let i = 0; i < this.activeRows.length; i++) {
                this.activeRows[i].lastSelected = i === maxIndex;
                this.activeRows[i].selected = indexesToSelect.includes(i);
            }
        });
    },

    updateColumnSizes() {
        this.colGroup = this.$root.querySelector('colgroup');
        if (!this.colGroup) return;

        this.colGroup.innerHTML = this.activeColumns
            .map(col => `<col style="width:${col.width || 'auto'}">`)
            .join('');
    },

    onHeaderClick(e, column) {
        e.stopImmediatePropagation();
        const mode = getColumnSelectMode(column, e);
        mode.select(column, this.activeColumns);
        this.sortRows();
    },

    onResizeMouseDown(e, colIndex) {
        e.stopImmediatePropagation();

        document.body.classList.add('column-resizing');
        const column = this.colGroup.children[colIndex];
        const startX = e.clientX;
        const startWidth = e.target.parentNode.offsetWidth;

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
    },

    onRowClick(event, row) {
        const multiSelect = event.ctrlKey;
        const rangeSelect = event.shiftKey;
        selectRow(this.activeRows, row, multiSelect, rangeSelect);
        emit(this.$root, 'row-selected', { row });
    },

    addRowClick() {
        emit(this.$root, 'add-row-click');
    }
}));
