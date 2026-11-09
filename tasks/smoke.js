import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { launch } from '../electron/tests/TestApplication.js';
import { runShutdownTests } from '../electron/tests/shutdown.smoke.js';
import { runExtensionRootTests } from '../electron/tests/extensionRoots.smoke.js';
import { prepareUserExtensions } from '../electron/tests/fixtures.js';

const suites = [
    'Startup', 'Shutdown', 'Persistence', 'History', 'Rendering',
    'Card display', 'Card List', 'Dialogs', 'Modals',
    'Extension roots', 'Extensions', 'Project files',
    'Set Icon Editor settings', 'Magic project settings', 'Statistics'
];

const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'card-magician-electron-'));

const customSuites = {
    'Extension roots': runExtensionRootTests,
    'Shutdown': runShutdownTests
};

function getExtensionsPath(suite, profilePath) {
    return suite === 'Extensions'
        ? path.join(profilePath, 'extensions')
        : undefined;
}

async function runSuite(suite) {
    console.log(`Running ${suite}...`);
    const profilePath = path.join(temp, suite);
    const customSuite = customSuites[suite];
    if (customSuite)
        return await customSuite(profilePath);
    if (suite === 'Extensions')
        await prepareUserExtensions(profilePath);

    const extensionsPath = getExtensionsPath(suite, profilePath);
    const fixture = await launch({
        profile: profilePath,
        url: '/tests/smoke.html',
        id: 'cardmagician.test',
        extensionsPath,
        args: [`--test-suite=${suite}`]
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
