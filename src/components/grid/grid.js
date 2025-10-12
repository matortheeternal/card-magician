import { registerComponent } from '../../componentRegistry.js';
import html from './grid.html';

registerComponent('grid', html, function(scope, { element, data }) {
    // TODO: sorting, filtering, column selection, item selection
    scope.onClick = function(column, row) {
        if (column.onItemClick)
            column.onItemClick(row);
    };
});
