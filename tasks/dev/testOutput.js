const RESULT_PREFIX = '@TEST_RESULT:';
const OUTPUT_PREFIX = '@TEST_OUTPUT:';

export function handleOutput(line) {
    if (line.startsWith(RESULT_PREFIX))
        return JSON.parse(line.slice(RESULT_PREFIX.length));
    if (line.startsWith(OUTPUT_PREFIX))
        process.stdout.write(JSON.parse(line.slice(OUTPUT_PREFIX.length)).message);
}
