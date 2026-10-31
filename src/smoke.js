import './shared/testing/textMatcher.js';
import { writeProcessOutput } from './shared/neutralinoAdapter.js';
import { exitApp } from './lifecycle.js';
import CustomReporter from './shared/testing/customReporter.js';

const RESULT_PREFIX = '@TEST_RESULT:';
const OUTPUT_PREFIX = '@TEST_OUTPUT:';

function getArgument(name) {
    const prefix = `${name}=`;
    const argument = NL_ARGS.find(arg => arg.startsWith(prefix));
    return argument?.slice(prefix.length);
}

function getSuiteId() {
    const targetSuite = getArgument('--test-suite');
    const top = jasmine.getEnv().topSuite();
    for (const suite of top.children || []) {
        if (suite.description === targetSuite)
            return suite.id;
    }
    throw new Error(`Test suite not found: ${targetSuite}`);
}

function verifyTestEnvironment() {
    if (NL_APPID === 'cardmagician.test') return;
    throw new Error(`Canceling smoke tests with unsupported appId "${NL_APPID}".`);
}

async function runTests() {
    log('startup').info('Initializing neutralino');
    Neutralino.init();

    log('startup').info('Verifying test environment');
    verifyTestEnvironment();

    log('startup').info('Clearing neutralino storage');
    await Neutralino.storage.clear();

    log('startup').info('Executing jasmine tests');
    const suiteId = getSuiteId();
    await jasmine.getEnv().execute([suiteId]);
}

function print(message) {
    return writeProcessOutput(OUTPUT_PREFIX + JSON.stringify({ message }) + '\n');
}

jasmine.getEnv().addReporter(
    new CustomReporter({ print, color: true })
);

jasmine.getEnv().addReporter({
    async jasmineDone(result) {
        const output = JSON.stringify({ status: result.overallStatus });
        await writeProcessOutput(RESULT_PREFIX + output + '\n');
        await new Promise(resolve => { setTimeout(resolve, 100); });
        if (!NL_ARGS.includes('--stay-open')) await exitApp();
    }
});



window.addEventListener('cm-loaded', () => {
    runTests().catch(err => {
        console.error(err.stack);
        exitApp(1);
    });
});

