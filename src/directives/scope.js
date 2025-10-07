export default function(Alpine) {
    Alpine.directive('scope', (el, { expression }, { evaluate, effect }) => {
        const parentScope = Alpine.closestDataStack(el)[0];
        const subScope = evaluate(expression);
        const path = expression.split('.');

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
}
