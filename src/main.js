import Alpine from 'alpinejs';
import '@shoelace-style/shoelace/dist/shoelace.js';
import './webComponents/**/*.js';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';
import './extensions.js';
import './shoelaceFixes.js';
import CardMagicianModule from './CardMagicianModule.js';
import CardMagicianGame from './CardMagicianGame.js';
import { loadTemplates, getTemplates } from './services/templateService.js';
import { loadGames, setGame } from './services/gameService.js';
import { setupTestHarness, runTests } from './tests';
import appConfig from './appConfig';
import './components/**/*.js';
import './directives/*.js';
import cacheManager from './gfx/CacheManager.js';

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
        return Neutralino.filesystem.createDirectory(dirPath).catch(() => {});
    });
}

async function setupNeutralino() {
    Neutralino.init();
    Neutralino.events.on('windowClose', () => Neutralino.app.exit(0));
    Neutralino.window.setSize({ resizable: true });
    Neutralino.window.setDraggableRegion('title-bar').then(result => {
        console.debug('%cDraggable region initialized:', 'color:salmon', result);
    });
    await ensureDirectories();
    Neutralino.server.mount('/modules', NL_PATH + '/modules');
    Neutralino.server.mount('/templates', NL_PATH + '/templates');
    Neutralino.server.mount('/games', NL_PATH + '/games');
    Neutralino.server.mount('/cache', NL_DATAPATH + '/cache');
}

function setupShoelace() {
    setBasePath('/shoelace');
}

function setupAlpine() {
    window.Alpine = Alpine;
    Alpine.store('views', {
        loaded: false,
        activeSet: { cards: [] },
        activeCard: null,
        hide(key) {
            this[key] = null;
        }
    });
    Alpine.start();
}

function setupModuleSystem() {
    window.CardMagicianModule = CardMagicianModule;
    window.CardMagicianGame = CardMagicianGame;
}

async function startApp() {
    if (NL_ARGS.includes("--run-tests")) {
        await setupTestHarness();
        await runTests();
        return;
    }
    Alpine.store('appConfig', appConfig);
    await loadGames();
    const game = await setGame('magic');
    Alpine.store('game', game);
    await loadTemplates();
    Alpine.store('templates', getTemplates());
    await cacheManager.preload();
    Alpine.store('views').loaded = true;
}

startApp();
