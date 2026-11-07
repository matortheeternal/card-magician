const RESULT_PREFIX = '@TEST_RESULT:';
const OUTPUT_PREFIX = '@TEST_OUTPUT:';

export function isTestOutput(line) {
    return line.startsWith(RESULT_PREFIX) || line.startsWith(OUTPUT_PREFIX);
}

export function handleOutput(line, write = message => process.stdout.write(message)) {
    if (line.startsWith(RESULT_PREFIX))
        return JSON.parse(line.slice(RESULT_PREFIX.length));
    if (line.startsWith(OUTPUT_PREFIX))
        write(JSON.parse(line.slice(OUTPUT_PREFIX.length)).message);
}
