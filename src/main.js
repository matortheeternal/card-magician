import '@shoelace-style/shoelace/dist/shoelace.js';
import '@shoelace-style/shoelace/dist/themes/dark.css';
import './components/ImageSelect.js';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';
import Alpine from 'alpinejs';
import registerFitText from './directives/fitText.js';
import registerScope from './directives/scope.js';
import { loadTemplates } from './templateBuilder';
import { loadViewData } from './views/baseView.js';
import { setupTestHarness, runTests } from './tests';

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
    registerFitText(Alpine);
    registerScope(Alpine);
    window.view = Alpine.reactive({});
    loadViewData();
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
