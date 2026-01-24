const serializers = [{
    test: val => val instanceof Error,
    serialize: val => val.stack
}, {
    test: val => typeof val === 'function',
    serialize: val => `[Function ${val.name || 'anonymous'}]`
}, {
    test: val => typeof val === 'symbol',
    serialize: val => val.toString()
}, {
    test: val => typeof val !== 'object' || val === null,
    serialize: val => val
}, {
    test: (val, seen) => seen.has(val),
    serialize: () => '[Circular]'
}, {
    test: val => Array.isArray(val),
    serialize: (val, seen, serialize, depth) => {
        seen.add(val);
        return val.map(v => serialize(v, depth + 1));
    }
}, {
    test: () => true,
    serialize: (val, seen, serialize, depth) => {
        seen.add(val);
        const out = {};
        for (const [k, v] of Object.entries(val))
            out[k] = serialize(v, depth + 1);
        return out;
    }
}];

export default function safeStringify(value, maxDepth = 4, maxLength = 10_000) {
    const seen = new Set();

    function serialize(val, depth) {
        if (depth > maxDepth) return '[MaxDepth]';
        const serializer = serializers.find(s => s.test(val, seen));
        if (!serializer) return;
        return serializer.serialize(val, seen, serialize, depth);
    }

    let result;
    try {
        result = JSON.stringify(serialize(value, 0), null, 2);
    } catch (error) {
        console.error(error);
        return '[Unserializable]';
    }

    if (result.length > maxLength)
        return result.slice(0, maxLength) + '\n[Truncated]';

    return result;
}
