function addPrototypeFunction(ctor, name, descriptor) {
    if (typeof ctor !== 'function' || !ctor.prototype)
        throw new TypeError('First argument must be a constructor function');
    if (typeof name !== 'string')
        throw new TypeError('Second argument must be a string');

    if (Object.prototype.hasOwnProperty.call(ctor.prototype, name)) {
        log('startup').warn(`${ctor.name}.prototype.${name} already defined — skipping.`);
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
 * @description Insert a separator before uppercase letters in camelCase
 *              or PascalCase strings.
 * Examples: `'camelCase'.separate()` → `'camel Case'`,
 *           `'HTMLParser'.separate()` → `'HTML Parser'`
 *           `'MyCoolClass'.separate('-')` → `'My-Cool-Class'`
 */
addPrototypeFunction(String, 'separate', {
    value: function separate(separator = ' ') {
        return this.replace(/([a-z])([A-Z])/g, `$1${separator}$2`);
    }
});

/**
 * @method
 * @name String#normalizeWords
 * @returns {string}
 * @param {RegExp} [sep] - Regex matching separators (defaults to /[^a-z0-9]+/gi)
 * @description Normalizes a string to be lowercase and separated by spaces.
 * Example: `'modal_back'.normalizeWords()` -> `'modal back'`
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
 * Example: `'modal back'.toTitleCase()` -> `'Modal Back'`
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
 * Example: `'modal back'.toCamelCase()` -> `'modalBack'`
 */
addPrototypeFunction(String, 'toCamelCase', {
    value: function toCamelCase() {
        return this.split(/\s+/)
            .map((w, i) =>
                i === 0 ? w : (w.charAt(0).toUpperCase() + w.slice(1))
            ).join('');
    }
});

/**
 * @method
 * @name Object#except
 * @param {...string} keysToExclude - A variable number of string keys to remove from
 *  the object.
 * @returns {object}
 * @description Creates a new object that has the specified keys removed.
 * Example: `{ a: 1, b: 2 }.except('a')` -> `{ b: 2 }`
 */
addPrototypeFunction(Object, 'except', {
    value: function except(...keysToExclude) {
        return Object.fromEntries(
            Object.entries(this).filter(([key]) => !keysToExclude.includes(key))
        );
    }
});

/**
 * @method
 * @name Array#remove
 * @param {any} item - An item to remove from the array.
 * @returns {object}
 * @description Removes the first instance of the item from the array if present.
 * Example: `[1, 2, 3].remove(2)` -> `[1, 3]`
 */
addPrototypeFunction(Array, 'remove', {
    value: function remove(item) {
        const index = this.indexOf(item);
        if (index > -1) this.splice(index, 1);
        return this;
    }
});

/**
 * @method
 * @name Array#zip
 * @param {Array<any>} otherArray - Another array to zip with.
 * @returns {Array<Array<any, any>>}
 * @description Combines two arrays together.
 * Example:
 * ```js
 * [1, 2, 3].zip(['a', 'b', 'c']);
 * // -> [[1, 'a'], [2, 'b'], [3, 'c']]
 * ```
 */
addPrototypeFunction(Array, 'zip', {
    value: function zip(otherArray) {
        const res = [];
        for (let i = 0; i < this.length && i < otherArray.length; i++)
            res.push([this[i], otherArray[i]]);
        return res;
    }
});

/**
 * @method
 * @name Array#toDictionary
 * @param {(item) => any} keyCallback - Callback function that returns the key to use
 * for a passed item.
 * @returns {object}
 * @description Transforms an array into a dictionary, keyed by the keys returned by
 * the keyCallback for each item.
 * Example:
 * ```js
 * [{ id: 'hello' }, { id: 'world' }].toDictionary(item => item.id);
 * // { hello: { id: 'hello' }, world: { id: 'world' } }
 * ```
 */
addPrototypeFunction(Array, 'toDictionary', {
    value: function toDictionary(keyCallback) {
        return this.reduce((dictionary, item) => {
            const key = keyCallback(item);
            if (Object.hasOwn(dictionary, key))
                throw new Error(`Encountered duplicate key ${key}`);
            dictionary[key] = item;
            return dictionary;
        }, {});
    }
});

/**
 * @method
 * @name Function#debounce
 * @param {number} delay - Debounce delay before function execution.
 * @returns {Function}
 * @description Creates a debounced wrapper around a function.
 * Example: const sayHello = (() => console.log('Hello World')).debounce(500);
 */
addPrototypeFunction(Function, 'debounce', {
    value: function debounce(delay) {
        let timeout = null;
        let context = null;
        let args = null;
        const func = this;

        const invoke = function() {
            timeout = null;
            func.apply(context, args);
        };

        const debounced = function() {
            context = this;
            args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(invoke, delay);
        };

        Object.defineProperty(debounced, 'cancel', {
            value: function cancel() {
                clearTimeout(timeout);
                timeout = null;
                context = null;
                args = null;
            }
        });

        Object.defineProperty(debounced, 'flush', {
            value: function flush() {
                if (timeout === null) return;
                clearTimeout(timeout);
                return invoke();
            }
        });

        return debounced;
    }
});
