import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import electron from 'electron';
import DevToolsDriver from './devToolsDriver.js';
import { handleOutput, isTestOutput } from './testOutput.js';

const root = path.resolve(import.meta.dirname, '../..');
const pause = ms => new Promise(resolve => { setTimeout(resolve, ms); });

export async function waitFor(check, label, timeout = 20000) {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
        const value = await check();
        if (value) return value;
        await pause(50);
    }
    throw new Error(`Timed out waiting for ${label}`);
}

function alive(pid) {
    try { process.kill(pid, 0); return true; } catch (error) {
        if (error.code === 'ESRCH') return false;
        throw error;
    }
}

export class TestApplication {
    output = '';
    processIds = [];

    constructor(options) {
        Object.assign(this, options);
        this.interrupted = () => {
            void this.cleanup().finally(() => process.exit(130));
        };
    }

    get exited() {
        if (this.spawnError) throw this.spawnError;
        return this.child.exitCode !== null || this.child.signalCode;
    }

    async start() {
        await fs.rm(path.join(this.profile, 'DevToolsActivePort'), { force: true });
        const binary = process.env.ELECTRON_SMOKE_BINARY ?? electron;
        const entry = process.env.ELECTRON_SMOKE_BINARY ? [] : [root];
        const sandbox = process.env.ELECTRON_NO_SANDBOX === '1' ? ['--no-sandbox'] : [];
        const args = [...entry, `--profile=${this.profile}`,
                      `--app-id=${this.id}`, `--url=${this.url}`,
                      '--remote-debugging-port=0',
                      ...sandbox, ...(this.args ?? [])];
        this.child = spawn(binary, args, {
            cwd: root, detached: process.platform !== 'win32',
            stdio: ['ignore', 'pipe', 'pipe']
        });
        this.closed = new Promise(resolve => { this.child.once('close', resolve); });
        this.captureOutput();
        process.once('SIGINT', this.interrupted);
        process.once('SIGTERM', this.interrupted);
        if (!['/tests/smoke.html', '/tests/tests.html'].includes(this.url))
            await this.connect();
    }

    captureOutput() {
        createInterface({ input: this.child.stdout }).on('line', line => {
            // Retain diagnostics, not a second copy of the live test report.
            if (!isTestOutput(line)) this.output += line + '\n';
            const reported = handleOutput(line, this.writeOutput);
            if (reported) this.testResult = reported;
        });
        this.child.stderr.on('data', data => {
            this.output += data;
            if (process.env.DEBUG_ELECTRON) process.stderr.write(data);
        });
        this.child.on('error', error => { this.spawnError = error; });
    }

    async debuggerEndpoint() {
        if (this.exited) throw new Error(this.output);
        try {
            const filename = path.join(this.profile, 'DevToolsActivePort');
            const lines = await fs.readFile(filename, 'utf8');
            const [port, endpoint] = lines.trim().split('\n');
            return endpoint ? `ws://127.0.0.1:${port}${endpoint}` : false;
        } catch (error) {
            if (error.code === 'ENOENT') return false;
            throw error;
        }
    }

    async connect() {
        const endpoint = await waitFor(
            () => this.debuggerEndpoint(), 'debugger endpoint'
        );
        this.driver = await DevToolsDriver.connect(endpoint);
        const target = this.url === '/' ? 'cm-app://app/' : this.url;
        await waitFor(() => this.driver.attach(target), 'application page');
        assert.equal(await this.driver.evaluate('typeof require'), 'undefined');
        assert.equal(await this.driver.evaluate('typeof process'), 'undefined');
        const { processInfo } = await this.driver.send('SystemInfo.getProcessInfo');
        this.processIds = processInfo.map(info => info.id);
    }

    async stopped() {
        await waitFor(() => this.exited, 'Electron exit', 10000);
        await this.closed;
        assert.equal(this.child.exitCode, 0, this.output);
        await waitFor(() => this.processIds.every(pid => !alive(pid)),
                      'Electron child cleanup', 10000);
    }

    async result() {
        await waitFor(() => this.exited, 'test completion', 120000);
        await this.stopped();
        assert.equal(this.testResult?.status, 'passed', this.output);
    }

    async cleanup() {
        process.removeListener('SIGINT', this.interrupted);
        process.removeListener('SIGTERM', this.interrupted);
        this.driver?.disconnect();
        if (!this.child || this.child.exitCode !== null || this.child.signalCode) return;
        if (process.platform === 'win32') {
            const args = ['/pid', String(this.child.pid), '/T', '/F'];
            const killer = spawn('taskkill', args);
            await new Promise(resolve => { killer.once('close', resolve); });
        } else {
            try { process.kill(-this.child.pid, 'SIGKILL'); } catch (error) {
                if (error.code !== 'ESRCH') throw error;
            }
        }
        await this.closed;
    }
}

export async function launch(options) {
    const application = new TestApplication(options);
    try {
        await application.start();
        return application;
    } catch (error) {
        await application.cleanup();
        throw new Error(`${error.stack}\n${application.output}`);
    }
}

export async function withTestProfile(label, callback) {
    const prefix = path.join(os.tmpdir(), `card-magician-${label}-`);
    const profile = await fs.mkdtemp(prefix);
    try {
        return await callback(profile);
    } finally {
        await fs.rm(profile, { recursive: true, force: true });
    }
}
