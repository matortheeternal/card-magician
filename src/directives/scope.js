import Alpine from 'alpinejs';

export function collectScopePath(el) {
    const scopes = [];
    let current = el.parentElement;
    while (current) {
        if (current.hasAttribute('x-scope'))
            scopes.unshift(current.getAttribute('x-scope'));
        if (current.hasAttribute('x-data')) break;
        current = current.parentElement;
    }
    return scopes;
}

Alpine.directive('scope', (el, { expression }, { evaluate, effect }) => {
    const parentScope = Alpine.closestDataStack(el)[0];
    const path = [...collectScopePath(el), expression].flatMap(p => p.split('.'));
    const subScope = evaluate(path.join('.'));

    function getParentValue() {
        return path.reduce((acc, key) => acc?.[key], parentScope);
    }

    const proxy = new Proxy(subScope, {
        get(target, prop) {
            // TODO: Support magics like $el, $refs, etc. if needed
            if (prop in target) return target[prop];
            const current = getParentValue();
            return current?.[prop];
        },
        set(target, prop, value) {
            const current = getParentValue();
            if (current) current[prop] = value;
            return true;
        }
    });

    effect(() => {
        const current = getParentValue();
        Object.assign(proxy, current);
    });

    Alpine.addScopeToNode(el, proxy);
    Alpine.initTree(el);
});
