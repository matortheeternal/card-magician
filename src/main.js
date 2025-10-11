import '@shoelace-style/shoelace/dist/shoelace.js';
import '@shoelace-style/shoelace/dist/themes/dark.css';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';
import Alpine from 'alpinejs';
import registerFitText from './directives/fitText.js';
import registerScope from './directives/scope.js';
import { buildTemplate, loadTemplates } from './templateBuilder';
import { setupTestHarness, runTests } from './tests';
import { buildForms } from './formBuilder';
import { saveHTMLAsImage } from './gfx/imageProcessing';
import { menuBarItems } from './menuBarItems.js';

// BASE SETUP
setBasePath('/shoelace')
Neutralino.init();
Neutralino.events.on("windowClose", () => Neutralino.app.exit(0));
makeDraggable();
window.Alpine = Alpine;
registerFitText(Alpine);
registerScope(Alpine);
window.view = Alpine.reactive({
    toggleMaximize: async () => {
        view.isMaximized
            ? await Neutralino.window.unmaximize()
            : await Neutralino.window.maximize();
        view.isMaximized = await Neutralino.window.isMaximized();
    },
    menuBarItems,
    isMaximized: false
});
Alpine.start();

async function makeDraggable() {
    await Neutralino.window.setSize({ resizable: true });
    const result = await Neutralino.window.setDraggableRegion('title-bar');
    console.log('Draggable region initialized:', result);
}

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
        exportImg: async function() {
            await saveHTMLAsImage(templateContainer, 'card.png');
        }
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
