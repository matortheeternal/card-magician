import { setupExitHandling } from './lifecycle.js';
import { loadTemplates } from './domain/template/templateRegistry.js';
import { loadGames, setGame } from './domain/game/gameManager.js';
import imageCache from './domain/graphics/ImageCache.js';
import {
    createDirectory, mount
} from './shared/platformAdapter.js';
import { loadExporters } from './domain/export/exporterManager.js';
import { loadScripts } from './domain/scripts/scriptManager.js';
import { applyDeviceLayout } from './ui/systems/deviceLayout.js';
import { tagManager } from './domain/game/tagManager.js';

const startupLog = log('startup');
const report = createReporter({ unit: 'startup' });

function ensureDirectories() {
    return createDirectory(appEnvironment.paths.data + '/cache/images');
}

async function setupPlatform() {
    await setupExitHandling();
    startupLog.debug('Platform initialized');
    startupLog.debug('Ensuring directories exist');
    await ensureDirectories();
    startupLog.debug('Directories created');
    startupLog.debug('Mounting directories');
    await mount('/modules', appEnvironment.paths.plugins + '/modules');
    await mount('/exporters', appEnvironment.paths.plugins + '/exporters');
    await mount('/templates', appEnvironment.paths.plugins + '/templates');
    await mount('/games', appEnvironment.paths.plugins + '/games');
    await mount('/cache', appEnvironment.paths.data + '/cache');
    startupLog.debug('Mounts done');
}

function setupDevState() {
    if (!appEnvironment.isDevelopment) return;
    startupLog.info('Development mode detected');
    const devState = document.createElement('dev-state');
    document.body.appendChild(devState);
    return devState;
}

function loaded() {
    const titleBar = document.createElement('cm-title-bar');
    document.body.prepend(titleBar);
    document.querySelector('main').innerHTML = (
        `<cm-display-card class="drawer-left"></cm-display-card>
         <cm-set-view></cm-set-view>
         <cm-card-form class="drawer-right"></cm-card-form>`
    );
    const mobileActions = document.createElement('cm-mobile-actions');
    document.body.append(mobileActions);
    const floatingStatus = document.createElement('cm-floating-status');
    document.body.append(floatingStatus);
}

async function startApp() {
    startupLog.debug('Loading games');
    await loadGames();
    startupLog.debug('Setting game to magic');
    await setGame('magic');
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
    applyDeviceLayout();
    loaded();
}

window.addEventListener('resize', applyDeviceLayout.debounce(200));


(async function() {
    try {
        await setupPlatform();
        const devState = setupDevState();
        await startApp();
        performance.mark('cm-ui-ready');
        if (devState) await devState.requestData();
        if (appEnvironment.args.includes('--test-exit')) {
            const { setupExitFixture } = await import('./shared/testing/exitFixture.js');
            await setupExitFixture();
        }
        if (appEnvironment.args.includes('--test-feasibility')) {
            const fixture = await import('./shared/testing/feasibilityFixture.js');
            await fixture.setupFeasibilityFixture();
        }
        window.dispatchEvent(new CustomEvent('cm-loaded'));
    } catch (error) {
        startupLog.error('Startup error:', error);
        report('startup', error);
        document.querySelector('cm-loader').showError();
    }
})();
