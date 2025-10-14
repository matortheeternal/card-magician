import Alpine from 'alpinejs';
import { getComponent } from '../componentRegistry.js';
import { mountAlpineEntity } from '../alpineHelpers.js';

function handleExpression(expressionOrId, evaluate) {
    if (!/^{/.test(expressionOrId))
        return [expressionOrId, {}];

    const { id, ...data } = evaluate(expressionOrId);
    return [id, data];
}

Alpine.directive('component', async (element, { expression }, { evaluate }) => {
    const [id, scopeData] = handleExpression(expression, evaluate);

    const component = getComponent(id);
    if (!component) return console.error(`Component not registered: ${id}`);

    const { controller, html } = component;
    const parentScope = Alpine.closestDataStack(element)[0];

    await mountAlpineEntity({
        element, html, controller, parentScope, scopeData
    });
});
