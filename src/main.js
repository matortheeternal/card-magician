import Alpine from 'alpinejs';
import '@shoelace-style/shoelace/dist/shoelace.js';
import './components/ImageSelect.js';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';
import { loadTemplates } from './templateBuilder';
import { setupTestHarness, runTests } from './tests';
import './directives/*.js';
import './views/**/*.js';

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
    window.view = Alpine.reactive({});
    Alpine.start();
}

async function startApp() {
    if (NL_ARGS.includes("--run-tests")) {
        await setupTestHarness();
        await runTests();
        return;
    }
    view.templates = await loadTemplates();
}

startApp();
