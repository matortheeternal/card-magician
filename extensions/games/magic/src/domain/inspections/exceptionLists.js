function exceptionKey({ condition, subtype, colors }) {
    return JSON.stringify([condition, subtype ?? null, [...colors].sort()]);
}

export function sameExceptions(first, second) {
    const keys = list => list.map(exceptionKey).join('\n');
    return keys(first) === keys(second);
}

export function storedException({ condition, subtype, colors }) {
    if (subtype === undefined) return { condition, colors: [...colors] };
    return { condition, subtype, colors: [...colors] };
}
