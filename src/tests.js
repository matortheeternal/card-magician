import { findTestFiles } from './shared/testing/findTestFiles.js';
import {
    terminateApp, onWindowClose, mount, writeProcessOutput
} from './shared/neutralinoAdapter.js';
import CustomReporter from './shared/testing/customReporter.js';

const RESULT_PREFIX = '@TEST_RESULT:';
const OUTPUT_PREFIX = '@TEST_OUTPUT:';

const env = jasmine.getEnv();
const urls = new jasmine.HtmlReporterV2Urls();

async function loadModuleTests() {
    const testFiles = await findTestFiles('modules');
    await mount('/modules', NL_PATH + '/modules');
    for (const file of testFiles)
        await import(`/${file}`);
}

function verifyTestEnvironment() {
    if (NL_APPID === 'cardmagician.test') return;
    throw new Error(`Canceling smoke tests with unsupported appId "${NL_APPID}".`);
}

async function runTests() {
    log('startup').info('Initializing neutralino');
    Neutralino.init();
    await onWindowClose(() => terminateApp());

    log('startup').info('Verifying test environment');
    verifyTestEnvironment();

    log('startup').info('Clearing neutralino storage');
    await Neutralino.storage.clear();

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
        if (!NL_ARGS.includes('--stay-open')) terminateApp();
    }
});



runTests();
