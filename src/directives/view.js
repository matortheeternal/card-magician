import Alpine from 'alpinejs';
import { getView } from '../viewRegistry.js';
import { toCamelCase } from '../utils.js';

Alpine.directive('view', (element, { expression: id }) => {
    const view = getView(id);
    if (!view) {
        console.error(`View not registered: ${id}`);
        return;
    }

    const dataId = toCamelCase(id, '-');
    const parentScope = Alpine.closestDataStack(element)[0];
    const scope = {};
    parentScope[dataId] = scope;
    element.innerHTML = view.html;
    element.setAttribute('x-scope', dataId);
    view.controller(scope, { parentScope, element });
});
