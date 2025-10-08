import Alpine from 'alpinejs';
import registerFitText from './directives/fitText.js';
import registerScope from './directives/scope.js';
import { buildTemplate, loadTemplates } from './templateBuilder';
import { setupTestHarness, runTests } from './tests';
import { buildForms } from './formBuilder';

// BASE SETUP
Neutralino.init();
Neutralino.events.on("windowClose", () => Neutralino.app.exit(0));
window.Alpine = Alpine;
registerFitText(Alpine);
registerScope(Alpine);
Alpine.start();

function publishTemplate(templateModel) {
    window.templateModel = templateModel;
    const forms = buildForms(templateModel);
    const main = document.querySelector('main');
    main.setAttribute('x-data', 'templateModel');
    const templateContainer = document.createElement('div');
    templateContainer.className = 'template-container';
    for (let model of Object.values(templateModel))
        templateContainer.appendChild(model.dom);

    main.appendChild(templateContainer);
    main.appendChild(forms);

    const cards = [...Object.values(templateModel)];
    Object.assign(templateModel, {
        save: async function() {
            const cardData = {};
            for (let card of cards) {
                cardData[card.id] = await card.save();
            }
            const jsonString = JSON.stringify(cardData);
            await Neutralino.filesystem.writeFile('./card.json', jsonString);
        },
        load: async function() {
            const jsonString = await Neutralino.filesystem.readFile('./card.json');
            const cardData = JSON.parse(jsonString);
            for (let card of cards) {
                await card.load(cardData[card.id]);
            }
        },
    });
}

// RUN TESTS OR LOAD APP
if (NL_ARGS.includes("--run-tests")) {
    setupTestHarness().then(runTests);
} else {
    loadTemplates().then(templates => {
        buildTemplate(templates[1]).then(publishTemplate);
    });
}
