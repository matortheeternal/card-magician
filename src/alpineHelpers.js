// alpineMount.js
import Alpine from 'alpinejs';

export async function mountAlpineEntity({
    element,
    html,
    controller,
    parentScope,
    scopeData = {},
    scopeName
}) {
    const scope = Alpine.reactive(scopeData);

    if (scopeName) {
        parentScope[scopeName] = scope;
        element.setAttribute('x-scope', scopeName);
    }
    Alpine.addScopeToNode(element, scope);

    element.innerHTML = html;

    if (typeof controller === 'function') {
        await controller(scope, { parentScope, element, data: scopeData });
    }

    await Alpine.nextTick(() => {
        Alpine.initTree(element);
    });

    return scope;
}
