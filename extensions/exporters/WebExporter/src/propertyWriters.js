const propertyWriters = [{
    test: value => value?.constructor?.name === 'ManaCost',
    write: value => value.symbols.map(sym => sym.raw)
}, {
    test: value => value?.constructor?.name === 'ImageFieldValue',
    write: () => null,
}, {
    test: () => true,
    write: value => value
}];

export function getPropertyWriter(value) {
    return propertyWriters.find(writer => {
        return writer.test(value);
    });
}
