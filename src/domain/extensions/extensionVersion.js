const VERSION = /^(\d+(?:\.\d+)*)(?:-([\da-z-]+(?:\.[\da-z-]+)*))?(?:\+[\da-z.-]+)?$/i;
const NUMERIC_IDENTIFIER = /^\d+$/;

export function parseVersion(version) {
    const match = VERSION.exec(String(version));
    if (!match) throw new Error(`Invalid extension version: ${version}`);
    return {
        numbers: match[1].split('.').map(Number),
        prerelease: match[2]?.split('.') ?? []
    };
}

function compareIdentifier(left, right) {
    if (left === right) return 0;
    const leftNumeric = NUMERIC_IDENTIFIER.test(left);
    const rightNumeric = NUMERIC_IDENTIFIER.test(right);
    if (leftNumeric && rightNumeric) return Math.sign(Number(left) - Number(right));
    if (leftNumeric !== rightNumeric) return leftNumeric ? -1 : 1;
    return left < right ? -1 : 1;
}

function comparePrerelease(left, right) {
    if (!left.length || !right.length)
        return Math.sign(right.length - left.length);
    for (let index = 0; index < Math.max(left.length, right.length); index++) {
        if (left[index] === undefined) return -1;
        if (right[index] === undefined) return 1;
        const result = compareIdentifier(left[index], right[index]);
        if (result) return result;
    }
    return 0;
}

export function compareVersions(left, right) {
    const a = parseVersion(left);
    const b = parseVersion(right);
    for (let index = 0; index < Math.max(a.numbers.length, b.numbers.length); index++) {
        const difference = (a.numbers[index] ?? 0) - (b.numbers[index] ?? 0);
        if (difference) return Math.sign(difference);
    }
    return comparePrerelease(a.prerelease, b.prerelease);
}
