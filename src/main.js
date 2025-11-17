import Alpine from 'alpinejs';
import '@shoelace-style/shoelace/dist/shoelace.js';
import './webComponents/**/*.js';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';
import './extensions.js';
import CardMagicianModule from './CardMagicianModule.js';
import { loadTemplates, getTemplates } from './services/templateService.js';
import { loadGames, setGame } from './services/gameService.js';
import { setupTestHarness, runTests } from './tests';
import appConfig from './appConfig';
import './components/**/*.js';
import './directives/*.js';

// BASE SETUP
setupNeutralino();
setupShoelace();
setupAlpine();
setupModuleSystem();

function setupShoelace() {
    setBasePath('/shoelace');
}

function setupNeutralino() {
    Neutralino.init();
    Neutralino.events.on('windowClose', () => Neutralino.app.exit(0));
    Neutralino.window.setSize({ resizable: true });
    Neutralino.window.setDraggableRegion('title-bar').then(result => {
        console.log('Draggable region initialized:', result);
    });
}

function setupAlpine() {
    window.Alpine = Alpine;
    Alpine.store('views', {
        loaded: false,
        activeSet: { cards: [] },
        activeCard: {},
        hide(key) {
            this[key] = null;
        }
    });
    Alpine.start();
}

function setupModuleSystem() {
    window.CardMagicianModule = CardMagicianModule;
}

async function startApp() {
    if (NL_ARGS.includes("--run-tests")) {
        await setupTestHarness();
        await runTests();
        return;
    }
    Alpine.store('appConfig', appConfig);
    await loadGames();
    Alpine.store('game', await setGame('magic'));
    await loadTemplates();
    Alpine.store('templates', getTemplates());
    Alpine.store('views').loaded = true;
}

startApp();
