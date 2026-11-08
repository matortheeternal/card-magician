import './shared/testing/textMatcher.js';
import platform from './shared/platformAdapter.js';
import { exitApp } from './lifecycle.js';
import CustomReporter from './shared/testing/customReporter.js';

const RESULT_PREFIX = '@TEST_RESULT:';
const OUTPUT_PREFIX = '@TEST_OUTPUT:';

function getArgument(name) {
    const prefix = `${name}=`;
    const argument = appEnvironment.args.find(arg => arg.startsWith(prefix));
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
    if (appEnvironment.id === 'cardmagician.test') return;
    throw new Error(`Unsupported test application ID: ${appEnvironment.id}`);
}

async function runTests() {
    log('startup').info('Verifying test environment');
    verifyTestEnvironment();

    log('startup').info('Clearing application storage');
    await platform.clearStoredData();

    log('startup').info('Executing jasmine tests');
    const suiteId = getSuiteId();
    await jasmine.getEnv().execute([suiteId]);
}

function print(message) {
    return platform.writeProcessOutput(
        OUTPUT_PREFIX + JSON.stringify({ message }) + '\n'
    );
}

jasmine.getEnv().addReporter(
    new CustomReporter({ print, color: true })
);

jasmine.getEnv().addReporter({
    async jasmineDone(result) {
        const output = JSON.stringify({ status: result.overallStatus });
        await platform.writeProcessOutput(RESULT_PREFIX + output + '\n');
        await new Promise(resolve => { setTimeout(resolve, 100); });
        if (!appEnvironment.args.includes('--stay-open')) exitApp();
    }
});

window.addEventListener('cm-loaded', () => {
    runTests().catch(err => {
        console.error(err.stack);
        exitApp(1);
    });
});

