import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { createInterface } from 'node:readline';

const RESULT_PREFIX = '@TEST_RESULT:';
const OUTPUT_PREFIX = '@TEST_OUTPUT:';
export const root = path.resolve(import.meta.dirname, '..', '..');
const productionConfigPath = path.join(root, 'neutralino.config.json');
const testConfigPath = path.join(root, 'neutralino.test.config.json');

export function createTestConfig() {
    const text = fs.readFileSync(productionConfigPath, 'utf8');
    const config = JSON.parse(text);
    config.applicationId = 'cardmagician.test';
    fs.writeFileSync(testConfigPath, JSON.stringify(config, null, 2));
}

export function handleOutput(stdout) {
    let result = null;
    for (const line of stdout.split('\n')) {
        if (line.startsWith(RESULT_PREFIX))
            result = JSON.parse(line.slice(RESULT_PREFIX.length));
        if (line.startsWith(OUTPUT_PREFIX)) {
            const { message } = JSON.parse(line.slice(OUTPUT_PREFIX.length));
            process.stdout.write(message);
        }
    }
    return result;
}

export function getArgs(url, additionalArgs) {
    const chromeArgs = ['--auto-open-devtools-for-tabs'];
    if (process.env.CHROME_NO_SANDBOX === '1') chromeArgs.push('--no-sandbox');
    if (process.env.CHROME_LOG_LEVEL) chromeArgs.push(`--log-level=${process.env.CHROME_LOG_LEVEL}`);
    return [
        'run', '--disable-auto-reload', '--',
        `--config-file=/neutralino.test.config.json`,
        `--url=${url}`,
        ...additionalArgs,
        '--disable-auto-reload',
        `--chrome-args="${chromeArgs.join(' ')}"`,
    ];
}

export function spawnTest(url, additionalArgs = []) {
    const args = getArgs(url, additionalArgs);

    return new Promise((resolve, reject) => {
        const child = spawn('neu', args, {
            cwd: root,
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'pipe']
        });

        const stdout = createInterface({ input: child.stdout });
        let receivedResult = false;

        stdout.on('line', line => {
            const result = handleOutput(line);
            if (!result) return;

            receivedResult = true;
            resolve(result);
        });

        child.stderr.on('data', chunk => {
            process.stderr.write(chunk);
        });

        child.on('error', reject);

        child.on('close', (code, signal) => {
            if (receivedResult) return;

            reject(new Error(
                `Test exited without result. code=${code}, signal=${signal}`
            ));
        });
    });
}
