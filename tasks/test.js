import { createTestConfig, spawnTest } from './dev/testHelpers.js';

async function runTests() {
    console.log(`Running unit tests...`);
    const result = await spawnTest('/tests/tests.html');
    const failed = result.status === 'failed';
    const color = `\x1b[${failed ? 31 : 32}m`;
    console.log(`  ${color}${result.status}\x1b[0m`);
    return failed;
}

createTestConfig();
runTests()
    .then(failed => {
        process.exit(failed ? 1 : 0);
    })
    .catch(err => {
        console.error(err, err?.stack);
        process.exit(1);
    });
