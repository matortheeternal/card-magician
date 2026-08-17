import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { createInterface } from 'node:readline';

const RESULT_PREFIX = 'CARD_MAGICIAN_TEST_RESULT:';
const suites = ['startup', 'persistence'];
const root = path.resolve(import.meta.dirname, '..');
const productionConfigPath = path.join(root, 'neutralino.config.json');
const testConfigPath = path.join(root, 'neutralino.test.config.json');

function createTestConfig() {
    const text = fs.readFileSync(productionConfigPath, 'utf8');
    const config = JSON.parse(text);
    config.applicationId = 'cardmagician.test';
    fs.writeFileSync(testConfigPath, JSON.stringify(config, null, 2));
}

function getSuiteArgs(suiteName) {
    return [
        'run', '--disable-auto-reload', '--',
        `--config-file=neutralino.test.config.json`, '--run-smoke-tests',
        `--test-suite=${suiteName}`, '--disable-auto-reload',
        '--chrome-args="--auto-open-devtools-for-tabs"',
    ];
}

function findTestResult(stdout) {
    for (const line of stdout.split('\n')) {
        if (line.startsWith(RESULT_PREFIX))
            return JSON.parse(line.slice(RESULT_PREFIX.length));
    }
}

function runSmokeTest(suiteName) {
    const args = getSuiteArgs(suiteName);
    return new Promise((resolve, reject) => {
        const child = spawn('neu', args, {
            cwd: root,
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'pipe']
        });

        const stdout = createInterface({ input: child.stdout });
        stdout.on('line', line => {
            const result = findTestResult(line);
            if (!result) return;
            resolve(result);
        });

        child.on('error', reject);
        child.on('exit', (code, signal) => {
            reject(`Smoke test exited. code=${code}, signal=${signal}`)
        });
    });
}

async function runTests() {
    let failed = false;
    for (const suiteName of suites) {
        console.log(`Running ${suiteName}...`);
        const result = await runSmokeTest(suiteName);
        const suiteFailed = result.status === 'failed';
        const color = `\x1b[${suiteFailed ? 31 : 32}m`;
        console.log(`  ${color}${result.status}\x1b[0m`);
        failed ||= suiteFailed;
    }

    process.exitCode = failed ? 1 : 0;
}

createTestConfig();
runTests();
