export function toCamelCase(str, sep = ' ') {
    return str.split(sep).map((word, n) => {
        return n > 0
            ? word[0].toUpperCase() + word.slice(1).toLowerCase()
            : word.toLowerCase();
    }).join('');
}
