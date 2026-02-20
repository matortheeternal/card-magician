function isOption(value) {
    return value
        && typeof value === 'object'
        && typeof value.id === 'string';
}

export default function createCardPropertyWrapper(card) {
    return new Proxy(card, {
        get(target, prop, receiver) {
            const value = Reflect.get(target, prop, receiver);
            return isOption(value)
                ? (value.compute?.(receiver, value) ?? value.id)
                : value;
        }
    });
}
