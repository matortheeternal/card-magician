import { mountExtensions } from './shared/extensionManager.js';
import { setupExitHandling } from './lifecycle.js';
import { loadTemplates } from './domain/template/templateRegistry.js';
import { loadGames, setGame } from './domain/game/gameManager.js';
import imageCache from './domain/graphics/ImageCache.js';
import platform from './shared/platformAdapter.js';
import { loadExporters } from './domain/export/exporterManager.js';
import { loadScripts } from './domain/scripts/scriptManager.js';
import { applyDeviceLayout } from './ui/systems/deviceLayout.js';
import { tagManager } from './domain/game/tagManager.js';
import {
    hideLoading,
    showLoading,
    showLoadingError
} from './ui/systems/loadingService.js';
import { emit } from './shared/htmlUtils.js';
import { registerAction } from './ui/systems/actionSystem.js';

const L = localize('main');
const startupLog = log('startup');
const report = createReporter({ unit: 'startup' });

function ensureDirectories() {
    return platform.createDirectory(appEnvironment.paths.data + '/cache/images');
}

async function setupPlatform() {
    await setupExitHandling();
    startupLog.debug('Platform initialized');
    startupLog.debug('Ensuring directories exist');
    await ensureDirectories();
    startupLog.debug('Directories created');
    startupLog.debug('Mounting directories');
    await mountExtensions();
    await platform.mount('/cache', appEnvironment.paths.data + '/cache');
    startupLog.debug('Mounts done');
}

function setupDevState() {
    if (!appEnvironment.isDevelopment) return;
    startupLog.info('Development mode detected');
    const devState = document.createElement('dev-state');
    document.body.appendChild(devState);
    return devState;
}

function showMainUI() {
    document.querySelector('main').innerHTML = (
        `<cm-title-bar></cm-title-bar>
        <sl-tab-group id="workspace-tabs">
            <sl-tab slot="nav" panel="cards">${L`Cards`}</sl-tab>
            <sl-tab slot="nav" panel="statistics">${L`Statistics`}</sl-tab>

            <sl-tab-panel name="cards">
                <cm-display-card class="drawer-left"></cm-display-card>
                 <cm-card-list></cm-card-list>
                 <cm-card-form class="drawer-right"></cm-card-form>
            </sl-tab-panel>
            <sl-tab-panel name="statistics">
                <cm-project-stats></cm-project-stats>
            </sl-tab-panel>
        </sl-tab-group>`
    );
    const mobileActions = document.createElement('cm-mobile-actions');
    document.body.append(mobileActions);
    const floatingStatus = document.createElement('cm-floating-status');
    document.body.append(floatingStatus);
}

async function startGameSession(gameId) {
    startupLog.debug(`Setting game to ${gameId}`);
    await setGame(gameId);
    startupLog.debug('Loading templates');
    await loadTemplates();
    startupLog.debug('Loading exporters');
    await loadExporters();
    startupLog.debug('Loading scripts');
    await loadScripts();
    startupLog.debug('Loading tags');
    await tagManager.load();
    startupLog.debug('Preloading image cache');
    await imageCache.preload();
    startupLog.info('Startup successful, loading UI');
    showMainUI();
    if (appEnvironment.args.includes('--test-exit')) {
        const { setupExitFixture } = await import('./shared/testing/exitFixture.js');
        await setupExitFixture();
    }
    hideLoading();
    emit(document.body, 'cm-loaded');
}

function showGameSelection() {
    startupLog.info('Showing game selection');
    const appTitleHtml = '<i>Card Magician</i>';
    document.querySelector('main').innerHTML = (
        `<h1>${L`Welcome to ${appTitleHtml}`}</h1>
        <small>${L`Choose a game and click start.`}</small>
        <cm-game-select></cm-game-select>
        <cm-startup-actions></cm-startup-actions>`
    );
    hideLoading();
}

async function startApp() {
    startupLog.debug('Loading games');
    await loadGames();
    applyDeviceLayout();
    showGameSelection();
}

registerAction('cm-select-game', async event => {
    try {
        showLoading();
        await startGameSession(event.detail.gameId);
    } catch (error) {
        startupLog.error('Startup error:', error);
        report('startup', error);
        showLoadingError();
    }
});

window.addEventListener('resize', applyDeviceLayout.debounce(200));

(async function() {
    try {
        await setupPlatform();
        const devState = setupDevState();
        await startApp();
        if (devState) await devState.requestData();
        window.dispatchEvent(new CustomEvent('cm-loaded'));
        platform.ready();
    } catch (error) {
        startupLog.error('Startup error:', error);
        report('startup', error);
        showLoadingError();
    }
})();
