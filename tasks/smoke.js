import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { launch } from '../electron/tests/TestApplication.js';
import { runShutdownTests } from '../electron/tests/shutdown.smoke.js';
import { runInstallPackageTests } from '../electron/tests/installPackage.smoke.js';

const suiteGroups = JSON.parse(
    await fs.readFile(new URL('../src/shared/testing/smokeSuites.json', import.meta.url))
);
const suites = Object.keys(suiteGroups);

const startScreenSuites = ['Project lifecycle', 'Start screen MSE import'];

const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'card-magician-electron-'));

async function runApplicationLifecycleTests(profilePath) {
    await runShutdownTests(profilePath);
    await runInstallPackageTests(profilePath);
}

const customSuites = {
    'Application lifecycle': runApplicationLifecycleTests
};

function startArgs(suite) {
    return startScreenSuites.includes(suite) ? ['--test-start-screen'] : [];
}

async function runSuite(suite) {
    console.log(`Running ${suite}...`);
    const profilePath = path.join(temp, suite);
    const customSuite = customSuites[suite];
    if (customSuite)
        return await customSuite(profilePath);
    const fixture = await launch({
        profile: profilePath,
        url: '/tests/smoke.html',
        id: 'cardmagician.test',
        args: [`--test-suite=${suite}`, ...startArgs(suite)]
    });

    try {
        await fixture.result();
    } finally {
        await fixture.cleanup();
    }
}

try {
    const requested = process.argv
        .find(arg => arg.startsWith('--suite='))
        ?.slice('--suite='.length);
    if (requested !== undefined && !suites.includes(requested))
        throw new Error(`Unknown smoke suite: ${requested}`);

    const suitesToRun = requested ? [requested] : suites;
    for (const suite of suitesToRun)
        await runSuite(suite);
    console.log('Smoke tests passed.');
} finally {
    await fs.rm(temp, { recursive: true, force: true });
}
