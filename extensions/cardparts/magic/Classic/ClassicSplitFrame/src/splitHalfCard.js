export default function splitHalfCard(half, parent) {
    return new Proxy(half, {
        get(target, prop, receiver) {
            if (prop in target) return Reflect.get(target, prop, receiver);
            return parent[prop];
        }
    });
}
