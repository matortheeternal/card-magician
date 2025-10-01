import Alpine from 'alpinejs';
import registerFitText from './fitText.js';
import {
    loadJson, checkFileExists, loadModule, getImageUrl, loadFont
} from './fsHelpers.js';
import { maskImage } from './imageProcessing.js';
import { buildForm } from './formBuilder.js';

// BASE SETUP
Neutralino.init();
Neutralino.events.on("windowClose", Neutralino.app.exit);
window.Alpine = Alpine;
Alpine.start();
registerFitText(Alpine);

// BUILD CARD
const buildCard = async function(template) {
    const dom = document.createElement('div');
    dom.className = 'card-container';
    const card = Alpine.reactive({
        fields: [],
        addField(field) {
            this.fields.push(field);
            this[field.id] = '';
        },
        publishElement(selector, html) {
            dom.querySelector(selector).innerHTML = html;
        },
        addStyle(styleCode) {
            const styleFragment = document.createElement('style');
            styleFragment.innerHTML = styleCode;
            dom.prepend(styleFragment);
        },
        setFrame(html) {
            dom.innerHTML = html;
        }
    });

    const utils = (modulePath) => ({
        async assetURL(path) {
            const filePath = ['modules', modulePath, 'assets', path].join('/');
            return await getImageUrl(filePath);
        },
        async loadFile(filename) {
            const filePath = ['modules', modulePath, filename].join('/');
            return await Neutralino.filesystem.readFile(filePath);
        },
        async maskImage(sourceUrl, maskUrl, width, height) {
            return await maskImage(sourceUrl, maskUrl, width, height);
        },
        updateCardImage(event, card, key) {
            const file = event.target.files[0];
            if (!file) return;
            if (card.artUrl && card.artUrl.startsWith('blob:'))
                URL.revokeObjectURL(card.artUrl);
            card[key] = URL.createObjectURL(file);
        },
        async loadFont(fontName, localPath) {
            const filePath = ['modules', modulePath, 'assets', localPath].join('/');
            await loadFont(fontName, filePath);
        }
    });

    for (let modulePath of template.info.modules)
        await loadModule(modulePath, card, utils(modulePath));

    window.card = card;
    const form = buildForm(card);
    const main = document.querySelector('main');
    main.innerHTML = '';
    main.setAttribute('x-data', 'card');
    main.appendChild(dom);
    main.appendChild(form);
}

const validTemplates = [];
async function loadTemplates() {
    const templates = await Neutralino.filesystem.readDirectory('templates');
    for (let template of templates) {
        const infoPath = './' + template.path + '/info.json';
        if (!await checkFileExists(infoPath)) continue;
        template.info = await loadJson(template.path + '/info.json');
        validTemplates.push(template);
    }
}

loadTemplates().then(() => {
    console.log(validTemplates);
    buildCard(validTemplates[1]);
});
