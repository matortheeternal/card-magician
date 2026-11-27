export default function subcardCard(subcard, parent) {
    return new Proxy(subcard, {
        get(target, prop, receiver) {
            if (prop in target) return Reflect.get(target, prop, receiver);
            return parent[prop];
        }
    });
}
