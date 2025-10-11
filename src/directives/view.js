import Alpine from 'alpinejs';
import { getView } from '../viewRegistry.js';
import { toCamelCase } from '../utils.js';

Alpine.directive('view', (el, { expression: id }) => {
    const view = getView(id);
    if (!view) {
        console.error(`View not registered: ${id}`);
        return;
    }

    const dataId = toCamelCase(id, '-');
    const parentScope = Alpine.closestDataStack(el)[0];
    const scope = {};
    parentScope[dataId] = scope;
    view.controller(scope);

    el.setAttribute('x-scope', dataId);
    el.innerHTML = view.html;
});
