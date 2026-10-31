import { findTestFiles } from './shared/testing/findTestFiles.js';
import {
    terminateApp, onWindowClose, mount, writeProcessOutput, clearStoredData
} from './shared/platformAdapter.js';
import CustomReporter from './shared/testing/customReporter.js';

const RESULT_PREFIX = '@TEST_RESULT:';
const OUTPUT_PREFIX = '@TEST_OUTPUT:';

const env = jasmine.getEnv();
const urls = new jasmine.HtmlReporterV2Urls();

async function loadModuleTests() {
    const testFiles = await findTestFiles('modules');
    await mount('/modules', appEnvironment.paths.content + '/modules');
    for (const file of testFiles)
        await import(`/${file}`);
}

function verifyTestEnvironment() {
    if (appEnvironment.id === 'cardmagician.test') return;
    throw new Error(`Unsupported test application ID: ${appEnvironment.id}`);
}

async function runTests() {
    await onWindowClose(() => terminateApp());

    log('startup').info('Verifying test environment');
    verifyTestEnvironment();

    log('startup').info('Clearing application storage');
    await clearStoredData();

    log('startup').info('Loading module tests');
    await loadModuleTests();

    log('startup').info('Executing jasmine tests');
    await env.execute();
}

function print(message) {
    return writeProcessOutput(OUTPUT_PREFIX + JSON.stringify({ message }) + '\n');
}

env.configure(urls.configFromCurrentUrl());
env.addReporter(new CustomReporter({ print }));
env.addReporter(new jasmine.HtmlReporterV2({ env, urls }));

env.addReporter({
    async jasmineDone(result) {
        const output = JSON.stringify({ status: result.overallStatus });
        await writeProcessOutput(RESULT_PREFIX + output + '\n');
        await new Promise(resolve => { setTimeout(resolve, 100); });
        if (!appEnvironment.args.includes('--stay-open')) terminateApp();
    }
});



runTests();
