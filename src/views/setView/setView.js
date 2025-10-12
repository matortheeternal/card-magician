import { registerView } from '../../viewRegistry.js';
import html from './setView.html';

registerView('set-view', html, function(scope, { parentScope }) {
    scope.gridColumns = [{
        label: 'Name',
        html: () => `<span x-text="row.name || 'Unnamed card'"></span>`,
        onItemClick: (card) => {
            parentScope.activeCard = card;
        }
    }];
});
