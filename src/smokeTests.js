import { loadScript } from './shared/testHelpers.js';
import { writeProcessError, writeProcessOutput } from './shared/neutralinoAdapter.js';

const JASMINE_BASE = 'https://cdn.jsdelivr.net/npm/jasmine-core@4.6.0/lib/jasmine-core';
const scripts = [
    `${JASMINE_BASE}/jasmine.js`,
    `${JASMINE_BASE}/jasmine-html.js`,
    `${JASMINE_BASE}/boot0.js`,
];

const suites = {
    startup: () => import('./startup.tests.js'),
    persistence: () => import('./domain/persistence.tests.js'),
};

function getArgument(name) {
    const prefix = `${name}=`;
    const argument = NL_ARGS.find(arg => arg.startsWith(prefix));
    return argument?.slice(prefix.length);
}

function getSuite() {
    const suiteName = getArgument('--test-suite');
    const loadSuite = suites[suiteName];

    if (!loadSuite)
        throw new Error(`Unknown smoke test suite "${suiteName}".`);

    return {
        name: suiteName,
        load: loadSuite
    };
}

function verifyTestEnvironment() {
    if (NL_APPID === 'cardmagician.test') return;
    throw new Error(`Canceling smoke tests with unsupported appId "${NL_APPID}".`);
}

function addProcessReporter(suiteName) {
    jasmine.getEnv().addReporter({
        async jasmineDone(result) {
            const output = JSON.stringify({
                suite: suiteName,
                status: result.overallStatus
            });

            await writeProcessOutput(`CARD_MAGICIAN_TEST_RESULT:${output}\n`);
        }
    });
}

export async function prepareSmokeTests() {
    log('startup').info('Preparing smoke test harness');
    verifyTestEnvironment();
    await Neutralino.storage.clear();
    for (const src of scripts)
        await loadScript(src);
}

export async function reportSmokeTestError(error) {
    await writeProcessError(`${error.stack ?? error}\n`);
    const output = JSON.stringify({
        suite: getArgument('--test-suite'),
        status: 'failed',
        error: error.stack ?? error
    });
    await writeProcessOutput(`CARD_MAGICIAN_TEST_RESULT:${output}\n`);
}

export async function runSmokeTests() {
    const suite = getSuite();
    log('startup').info(`Running smoke test suite "${suite.name}"`);
    await suite.load();
    addProcessReporter(suite.name);
    await new Promise((resolve) => { setTimeout(resolve); });
    await jasmine.getEnv().execute();
    await Neutralino.app.exit();
}
