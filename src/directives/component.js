import Alpine from 'alpinejs';
import { getComponent } from '../componentRegistry.js';
import { toCamelCase } from '../utils';
import { collectScopePath } from './scope';
import { mountAlpineEntity } from '../alpineHelpers.js';

function handleExpression(expressionOrId, evaluate) {
    try {
        if (!/^{/.test(expressionOrId))
            return [expressionOrId, {}];

        const { id, ...data } = evaluate(expressionOrId);
        return [id, data];
    } catch (e) {
        reject(e);
    }
}

Alpine.directive('component', async (element, { expression }, { evaluate }) => {
    const [id, data] = handleExpression(expression, evaluate);

    const component = getComponent(id);
    if (!component) return console.error(`Component not registered: ${id}`);

    const { controller, html } = component;
    const scopePath = collectScopePath(element).join('.');
    const parentScope = scopePath
        ? evaluate(scopePath)
        : Alpine.closestDataStack(element)[0];
    const scopeName = toCamelCase(id, '-');

    await mountAlpineEntity({
        element,
        html,
        controller,
        parentScope,
        scopeData: data,
        scopeName
    });
});
