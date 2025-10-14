import Alpine from 'alpinejs';

Alpine.directive('scope', (el, { expression }, { evaluate, effect }) => {
    const parentStack = Alpine.closestDataStack(el);
    const parentScope = parentStack[0];
    const subScope = evaluate(expression, { scope: parentScope }) || {};

    const proxy = new Proxy(subScope, {
        get(target, prop) {
            return prop in target ? target[prop] : parentScope?.[prop];
        },
        set(target, prop, value) {
            if (prop in target) target[prop] = value;
            else if (parentScope) parentScope[prop] = value;
            return true;
        }
    });

    effect(() => {
        Object.assign(proxy, subScope);
    });

    Alpine.addScopeToNode(el, proxy);
    el._x_dataStack = [proxy, ...parentStack];
});
