import { getJoinedPath, readFile } from '../../../shared/neutralinoAdapter.js';
import { checkFileExists } from '../../../shared/fsUtils.js';

const knownMultilineKeys = [
    /^rule_text(_\d)?$/,
    /^flavor_text(_\d)?$/,
    /^notes$/,
];

function isEmptyObject(obj) {
    return obj && typeof obj === 'object' && Object.keys(obj).length === 0;
}

function getType(key) {
    const isMultiline = knownMultilineKeys.some(expr => expr.test(key));
    return isMultiline ? { type: 'multiline' } : {};
}

function makeLineObject(match) {
    return {
        depth: match[1].length,
        key: match[2],
        ...getType(match[2]),
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
    for (const line of text.trimEnd().split(/\r?\n/)) {
        const match = line.match(/^(\t*)([^\s:]+):([^\n]*)$/);
        if (match && !shouldRollup(parsedLines, match[1].length)) {
            parsedLines.push(makeLineObject(match));
            continue;
        }
        const valueMatch = line.match(/^(\t*)([^\n]*)$/);
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

export async function loadMseFile(folderPath, filename) {
    const filePath = await getJoinedPath(folderPath, filename);
    if (!await checkFileExists(filePath))
        throw new Error(`MSE file not found at ${filePath}`);
    const text = await readFile(filePath);
    return parseMse(text.slice(1));
}
