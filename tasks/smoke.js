import { createTestConfig, spawnTest } from './dev/testHelpers.js';
import { runExitSmokeTests } from './dev/exitSmoke.js';

const suites = [
    'Startup',
    'Persistence',
    'Rendering',
    'Dialogs'
];

async function runTests() {
    let failed = false;
    for (const suiteName of suites) {
        console.log(`Running ${suiteName}...`);
        const result = await spawnTest('/tests/smoke.html', [
            `--test-suite=${suiteName}`
        ]);
        const suiteFailed = result.status === 'failed';
        const color = `\x1b[${suiteFailed ? 31 : 32}m`;
        console.log(`  ${color}${result.status}\x1b[0m`);
        failed ||= suiteFailed;
    }
    await runExitSmokeTests();
    return failed;
}

createTestConfig();
runTests().then(failed => {
    process.exit(failed ? 1 : 0);
}).catch(error => {
    console.error(error);
    process.exitCode = 1;
});
