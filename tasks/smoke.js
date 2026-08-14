import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const suites = ['startup'];
const root = path.resolve(import.meta.dirname, '..');
const productionConfigPath = path.join(root, 'neutralino.config.json');
const testConfigPath = path.join(root, 'neutralino.test.config.json');

function createTestConfig() {
    const text = fs.readFileSync(productionConfigPath, 'utf8');
    const config = JSON.parse(text);
    config.applicationId = 'cardmagician.test';
    fs.writeFileSync(testConfigPath, JSON.stringify(config, null, 2));
}

function runSuite(suiteName) {
    return spawnSync(
        'neu',
        [
            'run',
            '--disable-auto-reload',
            '--',
            `--config-file=neutralino.test.config.json`,
            '--run-smoke-tests',
            `--test-suite=${suiteName}`,
            '--disable-auto-reload',
            '--chrome-args="--auto-open-devtools-for-tabs"',
        ],
        {
            cwd: root,
            encoding: 'utf8'
        }
    );
}

function suiteFailed(result) {
    return result.error !== undefined
        || result.signal !== null
        || result.status !== 0
}

function printSuiteResult(suiteName, result) {
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    if (suiteFailed(result))
        console.error(`Suite failed "${suiteName}":`, result);
}

function runSuites() {
    let failed = false;
    for (const suiteName of suites) {
        console.log(`Running ${suiteName}...`);
        const result = runSuite(suiteName);
        printSuiteResult(suiteName, result);
        failed ||= suiteFailed(result);
    }

    process.exitCode = failed ? 1 : 0;
}

createTestConfig();
runSuites();
