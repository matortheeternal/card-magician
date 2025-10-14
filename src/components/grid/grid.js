import { registerComponent } from '../../componentRegistry.js';
import { toCamelCase } from '../../utils.js';
import html from './grid.html';

registerComponent('grid', html, function(scope, { element, data }) {
    scope.activeColumns = [];
    scope.activeRows = [];

    Alpine.effect(() => {
        const gridTemplateColumns = data.columns.map(column => {
            return column.width ? column.width : '1fr';
        }).join(' ');
        element.style.setProperty('--grid-template-columns', gridTemplateColumns);
    });

    Alpine.effect(() => {
        scope.activeColumns = scope.columns.map(column => {
            const activeColumn = { ...column };
            if (!activeColumn.id)
                activeColumn.id = toCamelCase(column.label);
            if (!activeColumn.display)
                activeColumn.display = makeDefaultDisplayFunction(activeColumn);
            return activeColumn;
        });
    });

    Alpine.effect(() => {
        scope.activeRows = scope.rows.map(row => {
            const cols = scope.activeColumns || [];
            const data = cols.reduce((obj, col) => {
                obj[col.id] = col.data(row.model);
                return obj;
            }, {});
            return { data, selected: false, original: row };
        });
    });

    function makeDefaultDisplayFunction(column) {
        return (row) => `<span>${row.data[column.id]}</span>`
    }

    // TODO: sorting, filtering, column selection, item selection, column resizing
    scope.onCellClick = function(column, row) {
        column.onItemClick && column.onItemClick(row);
    };
});
