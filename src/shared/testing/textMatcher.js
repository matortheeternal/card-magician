import { diffArrays } from 'diff';

function formatTextDiff(expected, actual) {
    let expectedLine = 1;
    let actualLine = 1;

    return diffArrays(expected.split('\n'), actual.split('\n'))
        .map(part => {
            if (!part.added && !part.removed) {
                expectedLine += part.value.length;
                actualLine += part.value.length;
                return [];
            }

            const prefix = part.added ? 'missing' : 'unexpected';
            const firstLine = part.added ? actualLine : expectedLine;

            if (part.added) actualLine += part.value.length;
            if (part.removed) expectedLine += part.value.length;

            return part.value.map((text, index) =>
                `${prefix} line ${firstLine + index}: ${JSON.stringify(text)}`
            );
        })
        .flat()
        .join('\n');
}

function getMessage(actual, expected, expectedName) {
    if (actual === expected)
        return `Expected text not to match ${expectedName}.`;

    return `Expected text to match ${expectedName}.\n\n`
        + formatTextDiff(expected, actual);
}

beforeAll(() => {
    jasmine.addMatchers({
        toEqualText: () => ({
            compare(actual, expected, expectedName = 'expected text') {
                const pass = actual === expected;
                const message = getMessage(actual, expected, expectedName);
                return { pass, message };
            },
        }),
    });
});
