import Alpine from 'alpinejs';
import '@shoelace-style/shoelace/dist/shoelace.js';
import './shared/extensions.js';
import './shared/localize.js';
import './ui/**/*.js';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';
import CardMagicianModule from './domain/template/CardMagicianModule.js';
import CardMagicianGame from './domain/game/CardMagicianGame.js';
import { loadTemplates, getTemplates } from './domain/template/templateRegistry.js';
import { loadGames, setGame } from './domain/game/gameManager.js';
import { setupTestHarness, runTests } from './tests';
import imageCache from './domain/gfx/ImageCache.js';
import Modal from './ui/modals/Modal.js';
import {
    createDirectory, initApp,
    mount,
    setDraggableRegion,
    setWindowSize
} from './shared/neutralinoAdapter.js';

// BASE SETUP
setupNeutralino();
setupShoelace();
setupAlpine();
setupModuleSystem();

async function ensureDirectories() {
    const paths = [
        NL_PATH + '/modules',
        NL_PATH + '/templates',
        NL_PATH + '/games',
        NL_DATAPATH + '/cache/images'
    ];
    return paths.map(dirPath => {
        return createDirectory(dirPath).catch(() => {});
    });
}

async function setupNeutralino() {
    initApp();
    await setWindowSize({ resizable: true });
    await setDraggableRegion('title-bar')
    await ensureDirectories();
    await mount('/modules', NL_PATH + '/modules');
    await mount('/templates', NL_PATH + '/templates');
    await mount('/games', NL_PATH + '/games');
    await mount('/cache', NL_DATAPATH + '/cache');
}

function setupShoelace() {
    setBasePath('/shoelace');
}

function setupAlpine() {
    window.Alpine = Alpine;
    Alpine.store('views', {
        loaded: false,
        activeCard: null
    });
    Alpine.start();
}

function setupModuleSystem() {
    window.CardMagicianModule = CardMagicianModule;
    window.CardMagicianGame = CardMagicianGame;
    window.Modal = Modal;
}

async function startApp() {
    if (NL_ARGS.includes('--run-tests')) {
        await setupTestHarness();
        await runTests();
        return;
    }
    await loadGames();
    await setGame('magic');
    await loadTemplates();
    await imageCache.preload();
    Alpine.store('views').loaded = true;
}

startApp();
