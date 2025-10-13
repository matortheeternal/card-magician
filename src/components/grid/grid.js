import { registerComponent } from '../../componentRegistry.js';
import html from './grid.html';

registerComponent('grid', html, function(scope, { element, data }) {
    Alpine.effect(() => {
        const gridTemplateColumns = data.columns.map(column => {
            return column.width ? column.width : '1fr';
        }).join(' ');
        element.style.setProperty('--grid-template-columns', gridTemplateColumns);
    });

    // TODO: sorting, filtering, column selection, item selection, column resizing
    scope.onCellClick = function(column, row) {
        column.onItemClick && column.onItemClick(row);
    };
});
