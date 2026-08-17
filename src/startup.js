import { loadTemplates } from './domain/template/templateRegistry.js';
import { loadGames, setGame } from './domain/game/gameManager.js';
import { runTests } from './tests';
import imageCache from './domain/graphics/ImageCache.js';
import {
    createDirectory, exitApp, initApp, mount, setWindowSize
} from './shared/neutralinoAdapter.js';
import { loadExporters } from './domain/export/exporterManager.js';
import { loadScripts } from './domain/scripts/scriptManager.js';
import { applyDeviceLayout } from './ui/systems/deviceLayout.js';
import { prepareSmokeTests, reportSmokeTestError, runSmokeTests } from './smokeTests.js';

const startupLog = log('startup');
const hasSmokeTestsArg = NL_ARGS.includes('--run-smoke-tests');

let devState;

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
    if (hasSmokeTestsArg) return;
    startupLog.info('Development mode detected');
    devState = document.createElement('dev-state');
    document.body.appendChild(devState);
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
    if (NL_RESMODE !== 'bundle') setupDevState();
    if (NL_ARGS.includes('--run-tests')) return runTests();
    if (hasSmokeTestsArg) await prepareSmokeTests();

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
    startupLog.debug('Preloading image cache');
    await imageCache.preload();
    startupLog.info('Startup successful, loading UI');
    applyDeviceLayout();
    loaded();
    if (devState) await devState.requestData();
}

(async function() {
    try {
        window.addEventListener('resize', applyDeviceLayout.debounce(200));
        window.addEventListener('beforeunload', () => {
            if (window.suppressExit) return;
            exitApp();
        });
        await setupNeutralino();
        await startApp();
        if (hasSmokeTestsArg) await runSmokeTests();
    } catch (error) {
        startupLog.error('Startup error:', error);
        if (hasSmokeTestsArg) await reportSmokeTestError(error);
        document.querySelector('cm-loader').showError();
    }
})();
