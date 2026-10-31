import { setupExitHandling } from './lifecycle.js';
import { loadTemplates } from './domain/template/templateRegistry.js';
import { loadGames, setGame } from './domain/game/gameManager.js';
import imageCache from './domain/graphics/ImageCache.js';
import {
    createDirectory, initApp, mount, setWindowSize
} from './shared/neutralinoAdapter.js';
import { loadExporters } from './domain/export/exporterManager.js';
import { loadScripts } from './domain/scripts/scriptManager.js';
import { applyDeviceLayout } from './ui/systems/deviceLayout.js';
import { tagManager } from './domain/game/tagManager.js';

const startupLog = log('startup');
const report = createReporter({ unit: 'startup' });

async function ensureDirectories() {
    const paths = [
        NL_PATH + '/modules',
        NL_PATH + '/templates',
        NL_PATH + '/games',
        NL_DATAPATH + '/cache/images'
    ];
    await Promise.all(paths.map(dirPath => {
        return createDirectory(dirPath).catch(() => {});
    }));
}

async function setupNeutralino() {
    await setupExitHandling();
    await initApp();
    startupLog.debug('Neutralino initialized');
    await setWindowSize({ resizable: true });
    startupLog.debug('Ensuring directories exist');
    await ensureDirectories();
    startupLog.debug('Directories created');
    startupLog.debug('Mounting directories');
    await mount('/modules', NL_PATH + '/modules');
    await mount('/exporters', NL_PATH + '/exporters');
    await mount('/templates', NL_PATH + '/templates');
    await mount('/games', NL_PATH + '/games');
    await mount('/cache', NL_DATAPATH + '/cache');
    startupLog.debug('Mounts done');
}

function setupDevState() {
    if (NL_RESMODE === 'bundle' || NL_APPID !== 'cardmagician') return;
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
        await setupNeutralino();
        const devState = setupDevState();
        await startApp();
        if (devState) await devState.requestData();
        window.dispatchEvent(new CustomEvent('cm-loaded'));
    } catch (error) {
        startupLog.error('Startup error:', error);
        report('startup', error);
        document.querySelector('cm-loader').showError();
    }
})();
