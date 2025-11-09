function addPrototypeFunction(ctor, name, descriptor) {
    if (typeof ctor !== 'function' || !ctor.prototype)
        throw new TypeError('First argument must be a constructor function');
    if (typeof name !== 'string')
        throw new TypeError('Second argument must be a string');

    if (Object.prototype.hasOwnProperty.call(ctor.prototype, name)) {
        console.warn(`${ctor.name}.prototype.${name} already defined — skipping.`);
        return;
    }

    const finalDescriptor = Object.assign(
        { writable: true, configurable: true, enumerable: false },
        descriptor
    );

    Object.defineProperty(ctor.prototype, name, finalDescriptor);
}

/**
 * @method
 * @name String#separate
 * @returns {string}
 * @description Insert a space before uppercase letters in camelCase or PascalCase strings.
 * Examples: 'camelCase'.separate() → 'camel Case',
 *           'HTMLParser'.separate() → 'HTML Parser'
 */
addPrototypeFunction(String, 'separate', {
    value: function separate() {
        return this.replace(/([a-z])([A-Z])/g, '$1 $2');
    }
});

/**
 * @method
 * @name String#normalizeWords
 * @returns {string}
 * @param {RegExp} [sep] - Regex matching separators (defaults to /[^a-z0-9]+/gi)
 * @description Normalizes a string to be lowercase and separated by spaces.
 * Example: `'modal_back'.normalizeWords() -> 'modal back'`
 */
addPrototypeFunction(String, 'normalizeWords', {
    value: function normalizeWords(sep = /[^a-z0-9]+/gi) {
        if (!(sep instanceof RegExp))
            throw new TypeError('separator must be a RegExp');
        return this.toLowerCase().replaceAll(sep, ' ').trim();
    }
});

/**
 * @method
 * @name String#toTitleCase
 * @returns {string}
 * @description Converts a space-separated string to Title Case.
 * Example: `'modal back'.toTitleCase() -> 'Modal Back'`
 */
addPrototypeFunction(String, 'toTitleCase', {
    value: function toTitleCase() {
        return this.split(/\s+/)
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
    }
});

/**
 * @method
 * @name String#toCamelCase
 * @returns {string}
 * @description Converts a space-separated string into camelCase.
 * Example: `'modal_back'.toCamelCase() -> 'modalBack'`
 */
addPrototypeFunction(String, 'toCamelCase', {
    value: function toCamelCase() {
        return this.split(/\s+/)
            .map((w, i) =>
                i === 0 ? w : (w.charAt(0).toUpperCase() + w.slice(1))
            ).join('');
    }
});

