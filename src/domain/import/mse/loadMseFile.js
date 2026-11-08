const RULE_TEXT_KEY_PATTERN = /^rule_text(_\d)?$/;
const FLAVOR_TEXT_KEY_PATTERN = /^flavor_text(_\d)?$/;
const NOTES_KEY_PATTERN = /^notes$/;
const LINE_SEPARATOR_PATTERN = /\r?\n/;
const PROPERTY_LINE_PATTERN = /^(\t*)([^:]+):([^\n]*)$/;
const CONTINUATION_LINE_PATTERN = /^(\t*)([^\n]*)$/;
const knownMultilineKeys = [
    RULE_TEXT_KEY_PATTERN,
    FLAVOR_TEXT_KEY_PATTERN,
    NOTES_KEY_PATTERN,
];

function isEmptyObject(obj) {
    return obj && typeof obj === 'object' && Object.keys(obj).length === 0;
}

function getType(key) {
    const isMultiline = knownMultilineKeys.some(expr => expr.test(key));
    return isMultiline ? { type: 'multiline' } : {};
}

function normalizeKey(key) {
    return key.trim().replace(/ +/g, '_');
}

function makeLineObject(match) {
    const key = normalizeKey(match[2]);
    return {
        depth: match[1].length,
        key,
        ...getType(key),
        value: match[3].slice(1)
    };
}

function findMultilineRoot(parsedLines, targetDepth) {
    for (let i = parsedLines.length - 1; i >= 0; i--) {
        if (parsedLines[i].depth === targetDepth)
            return i;
    }
}

function collectMultilineValues(parsedLines, rootIndex) {
    const values = [];
    while (parsedLines.length > rootIndex + 1) {
        const line = parsedLines.pop();
        values.unshift(`${line.key}: ${line.value}`);
    }
    if (parsedLines[rootIndex].value)
        values.unshift(parsedLines[rootIndex].value);
    return values;
}

function rollupMultiline(depth, lastValue, parsedLines) {
    const rootIndex = findMultilineRoot(parsedLines, depth - 1);
    parsedLines[rootIndex].type = 'multiline';
    parsedLines[rootIndex].value = [
        ...collectMultilineValues(parsedLines, rootIndex),
        lastValue
    ].join('\n');
}

function shouldRollup(parsedLines, depth) {
    const prevLine = parsedLines[parsedLines.length - 1];
    return prevLine?.type === 'multiline'
        && prevLine?.depth === depth - 1;
}

function parseMseLines(text) {
    const parsedLines = [];
    for (const line of text.trimEnd().split(LINE_SEPARATOR_PATTERN)) {
        const match = line.match(PROPERTY_LINE_PATTERN);
        if (match && !shouldRollup(parsedLines, match[1].length)) {
            parsedLines.push(makeLineObject(match));
            continue;
        }
        const valueMatch = line.match(CONTINUATION_LINE_PATTERN);
        rollupMultiline(valueMatch[1].length, valueMatch[2], parsedLines);
    }
    return parsedLines;
}

const valueWriters = [{
    match: (target, key) => Array.isArray(target[key]),
    write: (target, key, value) => target[key].push(value)
}, {
    match: (target, key) => Object.hasOwn(target, key),
    write: (target, key, value) => target[key] = [target[key], value]
}, {
    match: () => true,
    write: (target, key, value) => target[key] = value
}];

function writeLast(stack) {
    const [key, value] = stack.pop();
    const [,target] = stack[stack.length - 1];
    const writer = valueWriters.find(vw => vw.match(target, key));
    const finalValue = isEmptyObject(value) ? null : value;
    writer.write(target, key, finalValue);
}

export function parseMse(text) {
    const root = {};
    const stack = [['root', root]];
    for (const { depth, key, value } of parseMseLines(text)) {
        while (stack.length - 1 > depth) writeLast(stack);
        stack.push([key, value || {}]);
    }
    while (stack.length - 1 > 0) writeLast(stack);
    return root;
}
