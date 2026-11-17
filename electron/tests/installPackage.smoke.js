import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { launch, waitFor } from './TestApplication.js';
import { createPackage } from './fixtures.js';

const root = path.resolve(import.meta.dirname, '../..');

function isGameFile(relativePath) {
    return !relativePath.startsWith('node_modules/')
        && !relativePath.startsWith('src/')
        && !relativePath.endsWith('.map');
}

async function packageMagic(folder) {
    const packagePath = path.join(folder, 'magic.cmpkg');
    const source = path.join(root, 'extensions/games/magic');
    await createPackage(source, 'magic', packagePath, isGameFile);
    return packagePath;
}

function offeredGames(driver) {
    return driver.evaluate(`(async () => {
        const startScreen = document.querySelector('cm-start-screen');
        if (!startScreen) return null;
        startScreen.querySelector('[data-click-action="newProject"]')?.click();
        const select = startScreen.querySelector('cm-game-select');
        if (!select) return null;
        return [...select.querySelectorAll('sl-option')].map(option => option.value);
    })()`);
}

function installFromModal(driver) {
    return driver.evaluate(`(async () => {
        const modal = document.querySelector('cm-install-package-modal');
        if (!modal) return false;
        await modal.installButton.updateComplete;
        if (modal.installButton.disabled) return false;
        modal.installButton.click();
        return true;
    })()`);
}

export async function runInstallPackageTests(temp) {
    console.log('Running Install package: start screen offers an installed game...');
    const folder = path.join(temp, 'install-package');
    const extensionsPath = path.join(folder, 'extensions');
    await fs.mkdir(extensionsPath, { recursive: true });
    const packagePath = await packageMagic(folder);
    const fixture = await launch({
        profile: path.join(folder, 'profile'), url: '/', id: 'cardmagician.test',
        extensionsPath, args: [packagePath]
    });
    try {
        const { driver } = fixture;
        assert.deepEqual(
            await waitFor(() => offeredGames(driver), 'start screen'), []
        );
        await waitFor(() => installFromModal(driver), 'install package modal');
        await waitFor(
            async () => {
                const games = await offeredGames(driver).catch(() => null);
                return games?.includes('magic');
            },
            'installed game on the start screen'
        );
        const installed = path.join(extensionsPath, 'games/magic/game.json');
        assert.equal(JSON.parse(await fs.readFile(installed, 'utf8')).id, 'magic');
    } finally {
        await fixture.cleanup();
    }
}
