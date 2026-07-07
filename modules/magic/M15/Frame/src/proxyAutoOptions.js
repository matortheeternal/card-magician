export default function proxyAutoOptions(card, fields) {
    return new Proxy(card, {
        get(target, prop, receiver) {
            const value = Reflect.get(target, prop, receiver);
            const field  = fields.find(f => f.id === prop);
            if (field?.type !== 'select') return value;
            const option = field.options.find(opt => opt.id === value);
            return option?.compute
                ? option.compute(target)
                : value;

        }
    });
}
