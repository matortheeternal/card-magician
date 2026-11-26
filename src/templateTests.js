import platform from './shared/platformAdapter.js';
import { exitApp } from './lifecycle.js';
import CustomReporter from './shared/testing/customReporter.js';
import TemplateTestProject from './shared/testing/templateTests/TemplateTestProject.js';
import {
    describeTemplateTests
} from './shared/testing/templateTests/describeTemplateTests.js';

const RESULT_PREFIX = '@TEST_RESULT:';
const OUTPUT_PREFIX = '@TEST_OUTPUT:';
const SPEC_TIMEOUT_MS = 60000;

function getArgument(name) {
    const prefix = `${name}=`;
    const argument = appEnvironment.args.find(arg => arg.startsWith(prefix));
    return argument?.slice(prefix.length);
}

function verifyTestEnvironment() {
    if (appEnvironment.id === 'cardmagician.test') return;
    throw new Error(`Unsupported test application ID: ${appEnvironment.id}`);
}

async function startTemplateTests() {
    verifyTestEnvironment();
    await platform.clearStoredData();
    const templateFilter = getArgument('--template');
    const projects = await TemplateTestProject.findAll(templateFilter);
    if (!projects.length) throw new Error(`No template tests found: ${templateFilter}`);
    const options = { record: appEnvironment.args.includes('--record') };
    for (const project of projects) describeTemplateTests(project, options);
    await jasmine.getEnv().execute();
}

function print(message) {
    return platform.writeProcessOutput(
        OUTPUT_PREFIX + JSON.stringify({ message }) + '\n'
    );
}

function failTemplateTests(error) {
    console.error(error.stack);
    void print(`${error.stack}\n`).finally(() => exitApp(1));
}

jasmine.DEFAULT_TIMEOUT_INTERVAL = SPEC_TIMEOUT_MS;
jasmine.getEnv().configure({ random: false });

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
    void startTemplateTests().catch(failTemplateTests);
}, { once: true });
