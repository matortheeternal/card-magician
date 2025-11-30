import Alpine from 'alpinejs';

/*
 * x-prop:key="expression"
 * Assigns an expression to an HTMLElement's property key.
 * Checks for changes by reference.
 */
Alpine.directive('prop', (
    el,
    { expression, value: propName },
    { evaluate, cleanup, Alpine }
) => {
    if (!propName)
        throw new Error(`x-prop must have a property name`);

    const propWatcher = Alpine.watch(
        () => evaluate(expression),
        (newValue, oldValue) => {
            if (newValue === oldValue) return;
            el[propName] = newValue;
        }
    );

    el[propName] = evaluate(expression);
    cleanup(propWatcher);
});
