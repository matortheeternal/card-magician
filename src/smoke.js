import './shared/testing/textMatcher.js';
import platform from './shared/platformAdapter.js';
import { exitApp } from './lifecycle.js';
import CustomReporter from './shared/testing/customReporter.js';
import { executeAction } from './ui/systems/actionSystem.js';
import { getGames } from './domain/game/gameManager.js';

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

async function startSmokeSession() {
    log('startup').info('Verifying test environment');
    verifyTestEnvironment();

    log('startup').info('Clearing application storage');
    await platform.clearStoredData();

    if (!getGames().some(game => game.id === 'magic'))
        throw new Error('Magic is not installed.');
    const folder = await platform.getJoinedPath(appEnvironment.paths.data, 'smoke');
    try { await platform.rmrf(folder); } catch {}
    const projectPath = await platform.getJoinedPath(folder, 'test.cmproj');

    document.body.addEventListener('cm-loaded', () => {
        void runTests().catch(failSmoke);
    }, { once: true });
    await executeAction('start-new-project', 'magic', projectPath);
}

async function runTests() {
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

function failSmoke(error) {
    console.error(error.stack);
    exitApp(1);
}

window.addEventListener('cm-loaded', () => {
    void startSmokeSession().catch(failSmoke);
}, { once: true });

