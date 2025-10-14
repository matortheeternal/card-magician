import { registerComponent } from '../../componentRegistry.js';
import html from './setView.html';

registerComponent('set-view', html, function(scope, { parentScope, element }) {
    scope.gridColumns = view.game.gridColumns;

    scope.setActiveCard = function(card) {
        parentScope.activeCard = card;
    };

    Alpine.initTree(element);
});
