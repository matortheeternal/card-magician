import Alpine from 'alpinejs';
import { getComponent } from '../componentRegistry.js';
import { toCamelCase } from '../utils';

function handleExpression(expressionOrId, evaluateLater) {
    return new Promise((resolve, reject) => {
        try {
            if (!/^{/.test(expressionOrId)) {
                resolve([expressionOrId, {}]);
                return;
            }

            evaluateLater(expressionOrId)(({ id, ...data }) => {
                resolve([id, data]);
            });
        } catch (e) {
            reject(e);
        }
    });
}

Alpine.directive('component', (el, { expression: expressionOrId }, { evaluateLater }) => {
    handleExpression(expressionOrId, evaluateLater).then(([id, data]) => {
        const component = getComponent(id);
        if (!component) {
            console.error(`Component not registered: ${id}`);
            return;
        }

        const dataId = toCamelCase(id, '-');
        const parentScope = Alpine.closestDataStack(el)[0];
        const scope = { ...data };
        parentScope[dataId] = scope;
        const { controller } = component;
        controller && controller(scope, { parentScope, data });

        el.setAttribute('x-scope', dataId);
        el.innerHTML = component.html;
    });
});
