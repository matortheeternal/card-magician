import Alpine from 'alpinejs';
import registerFitText from './fitText.js';
import { buildCard, loadTemplates } from './cardBuilder';
import { setupTestHarness, runTests } from './tests';

// BASE SETUP
Neutralino.init();
Neutralino.events.on("windowClose", () => Neutralino.app.exit(0));
window.Alpine = Alpine;
Alpine.start();
registerFitText(Alpine);

// RUN TESTS OR LOAD APP
if (NL_ARGS.includes("--run-tests")) {
    setupTestHarness().then(runTests);
} else {
    loadTemplates().then(validTemplates => {
        buildCard(validTemplates[1]).then(() => console.log('Card loaded!'));
    });
}
