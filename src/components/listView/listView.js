import Alpine from 'alpinejs';
import { emit } from '../../utils.js';
import { selectRow } from './rowSelectionService.js';
import { registerAction } from '../../actionRegistry';
import html from './listView.html';

function makeDefaultDisplayFunction(column) {
    return (row) => `<span>${row.data[column.id]}</span>`;
}

Alpine.data('listView', (config) => ({
    columns: config.columns || [],
    rows: config.rows || [],
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
            if (!active.id) active.id = col.label.toCamelCase();
            if (!active.display) active.display = makeDefaultDisplayFunction(active);
            return active;
        });
    },

    computeRows() {
        const oldRowMap = new Map((this.activeRows || []).map(r => [r.original, r]));
        this.activeRows = this.rows.map(row => {
            const cols = this.activeColumns || [];
            const data = cols.reduce((obj, col) => {
                obj[col.id] = col.data(row.model);
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
    },

    bindEvents() {
        registerAction('get-listview-selection', () => {
            return this.activeRows.filter(r => r.selected);
        });
    },

    updateColumnSizes() {
        this.colGroup = this.$root.querySelector('colgroup');
        if (!this.colGroup) return;

        this.colGroup.innerHTML = this.activeColumns
            .map(col => `<col style="width:${col.width || 'auto'}">`)
            .join('');
    },

    onHeaderClick(e, colIndex) {
        // TODO: sort
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
}));
