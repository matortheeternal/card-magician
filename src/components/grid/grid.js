import Alpine from 'alpinejs';
import { toCamelCase, emit } from '../../utils.js';
import html from './grid.html';

function makeDefaultDisplayFunction(column) {
    return (row) => `<span>${row.data[column.id]}</span>`;
}

Alpine.data('grid', (config) => ({
    columns: config.columns || [],
    rows: config.rows || [],
    activeColumns: [],
    activeRows: [],
    async init() {
        this.$watch('columns', () => this.computeColumns());
        this.$watch('rows', () => this.computeRows());
        this.$watch('activeColumns', () => this.computeRows());
        this.$watch('columns', () => this.updateGridTemplate());

        this.computeColumns();
        this.computeRows();
        this.updateGridTemplate();

        this.$root.innerHTML = html;
        Alpine.initTree(this.$root);
    },

    computeColumns() {
        this.activeColumns = this.columns.map(col => {
            const active = { ...col };
            if (!active.id) active.id = toCamelCase(col.label);
            if (!active.display) active.display = makeDefaultDisplayFunction(active);
            return active;
        });
    },

    computeRows() {
        this.activeRows = this.rows.map(row => {
            const cols = this.activeColumns || [];
            const data = cols.reduce((obj, col) => {
                obj[col.id] = col.data(row.model);
                return obj;
            }, {});
            return { data, selected: false, original: row };
        });
    },

    updateGridTemplate() {
        const gridTemplateColumns = this.columns
            .map(col => col.width || '1fr')
            .join(' ');
        this.$root.style.setProperty('--grid-template-columns', gridTemplateColumns);
    },

    onRowClick(row) {
        emit(this.$root, 'row-selected', { row })
    },

    // onCellClick(column, row) {
    //     column.onItemClick && column.onItemClick(row, Alpine);
    // }
}));
