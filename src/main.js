import '@shoelace-style/shoelace/dist/shoelace.js';
import './shared/log.js';
import './shared/extensions.js';
import './shared/localize.js';
import './domain/template/CardMagicianModule.js';
import './domain/game/CardMagicianGame.js';
import './ui/**/*.js';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';
import { loadTemplates } from './domain/template/templateRegistry.js';
import { loadGames, setGame } from './domain/game/gameManager.js';
import { runTests } from './tests';
import imageCache from './domain/graphics/ImageCache.js';
import {
    createDirectory, initApp, mount, setWindowSize
} from './shared/neutralinoAdapter.js';

const startupLog = log('startup');

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
    await mount('/templates', NL_PATH + '/templates');
    await mount('/games', NL_PATH + '/games');
    await mount('/cache', NL_DATAPATH + '/cache');
    startupLog.debug('Mounts done');
}

function setupDevState() {
    startupLog.info('Development mode detected');
    const devState = document.createElement('dev-state');
    document.body.appendChild(devState);
}

function loaded() {
    const titleBar = document.createElement('cm-title-bar');
    document.body.prepend(titleBar);
    document.querySelector('main').innerHTML = (
        `<cm-display-card></cm-display-card>
         <cm-set-view></cm-set-view>
         <cm-card-form></cm-card-form>`
    );
}

async function startApp() {
    if (NL_RESMODE !== 'bundle') setupDevState();
    if (NL_ARGS.includes('--run-tests'))
        return await runTests();

    startupLog.debug('Loading games');
    await loadGames();
    startupLog.debug('Setting game to magic');
    await setGame('magic');
    startupLog.debug('Loading templates');
    await loadTemplates();
    startupLog.debug('Preloading image cache');
    await imageCache.preload();
    startupLog.info('Startup successful, loading UI');
    loaded();
}

(async function() {
    try {
        await setupNeutralino();
        setBasePath('/shoelace');
        await startApp();
    } catch (error) {
        startupLog.error('Startup error:', error);
        document.querySelector('cm-loader').showError();
    }
})();
