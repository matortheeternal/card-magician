import Alpine from 'alpinejs';
import { getComponent } from '../componentRegistry.js';
import { toCamelCase } from '../utils';
import { collectScopePath } from './scope';

function handleExpression(expressionOrId, evaluate) {
    return new Promise((resolve, reject) => {
        try {
            if (!/^{/.test(expressionOrId)) {
                resolve([expressionOrId, {}]);
                return;
            }

            const { id, ...data } = evaluate(expressionOrId);
            resolve([id, data]);
        } catch (e) {
            reject(e);
        }
    });
}

Alpine.directive('component', (element, { expression }, { evaluate }) => {
    handleExpression(expression, evaluate).then(([id, data]) => {
        const component = getComponent(id);
        if (!component) {
            console.error(`Component not registered: ${id}`);
            return;
        }

        const { controller } = component;
        if (controller) {
            const dataId = toCamelCase(id, '-');
            const parentScope = evaluate(collectScopePath(element).join('.'));
            const scope = Alpine.reactive({ ...data });
            parentScope[dataId] = scope;
            controller(scope, { parentScope, data, element });

            element.setAttribute('x-scope', dataId);
        }

        element.innerHTML = component.html;
    });
});
