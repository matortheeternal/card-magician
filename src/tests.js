import { getExtensionDirectory, mountExtensions } from './shared/extensionManager.js';
import { findTestFiles } from './shared/testing/findTestFiles.js';
import platform from './shared/platformAdapter.js';
import CustomReporter from './shared/testing/customReporter.js';

const RESULT_PREFIX = '@TEST_RESULT:';
const OUTPUT_PREFIX = '@TEST_OUTPUT:';

const env = jasmine.getEnv();
const urls = new jasmine.HtmlReporterV2Urls();

async function loadModuleTests() {
    await mountExtensions();
    const directory = getExtensionDirectory().child('cardparts');
    const testFiles = await findTestFiles(directory.filePath);
    for (const file of testFiles)
        await import(directory.url(file.slice(directory.filePath.length + 1)));
}

function verifyTestEnvironment() {
    if (appEnvironment.id === 'cardmagician.test') return;
    throw new Error(`Unsupported test application ID: ${appEnvironment.id}`);
}

async function runTests() {
    await platform.onWindowClose(() => platform.terminateApp());

    log('startup').info('Verifying test environment');
    verifyTestEnvironment();

    log('startup').info('Clearing application storage');
    await platform.clearStoredData();

    log('startup').info('Loading module tests');
    await loadModuleTests();

    log('startup').info('Executing jasmine tests');
    await env.execute();
}

function print(message) {
    return platform.writeProcessOutput(
        OUTPUT_PREFIX + JSON.stringify({ message }) + '\n'
    );
}

env.configure(urls.configFromCurrentUrl());
env.addReporter(new CustomReporter({ print }));
env.addReporter(new jasmine.HtmlReporterV2({ env, urls }));

env.addReporter({
    async jasmineDone(result) {
        const output = JSON.stringify({ status: result.overallStatus });
        await platform.writeProcessOutput(RESULT_PREFIX + output + '\n');
        await new Promise(resolve => { setTimeout(resolve, 100); });
        if (!appEnvironment.args.includes('--stay-open')) platform.terminateApp();
    }
});



runTests();
