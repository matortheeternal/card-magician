import { registerView } from '../../viewRegistry.js';
import html from './setView.html';

registerView('set-view', html, function(scope, { parentScope, element }) {
    scope.gridColumns = view.game.gridColumns;

    scope.setActiveCard = function(card) {
        parentScope.activeCard = card;
    };

    Alpine.initTree(element);
});
