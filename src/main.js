import Alpine from 'alpinejs';
import '@shoelace-style/shoelace/dist/shoelace.js';
import './webComponents/imageSelect/imageSelect.js';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';
import { loadTemplates } from './templateBuilder';
import { loadGames, setGame } from './gameService';
import { setupTestHarness, runTests } from './tests';
import './components/**/*.js';
import './directives/*.js';

// BASE SETUP
setupNeutralino();
setupShoelace();
setupAlpine();

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
    window.view = Alpine.reactive({
        activeSet: null,
        activeCard: null
    });
    Alpine.start();
}

async function startApp() {
    if (NL_ARGS.includes("--run-tests")) {
        await setupTestHarness();
        await runTests();
        return;
    }
    await loadGames();
    view.game = await setGame('magic');
    await loadTemplates();
    view.activeSet = { cards: [] };
}

startApp();
