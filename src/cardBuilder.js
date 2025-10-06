import {checkFileExists, loadJson, loadModule} from './fsHelpers';
import { buildForm } from './formBuilder';
import { buildModuleUtils } from './moduleUtils.js';

function publishCard(card, dom) {
    window.card = card;
    const form = buildForm(card);
    const main = document.querySelector('main');
    main.innerHTML = '';
    main.setAttribute('x-data', 'card');
    main.appendChild(dom);
    main.appendChild(form);
}

function initCard(dom) {
    return Alpine.reactive({
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
        },
        async save() {
            const cardData = {};
            for (const field of card.fields)
                cardData[field.id] = field.hasOwnProperty('save')
                    ? await field.save()
                    : card[field.id];
            const jsonString = JSON.stringify(cardData);
            await Neutralino.filesystem.writeFile('./card.json', jsonString);
        },
        async load() {
            const jsonString = await Neutralino.filesystem.readFile('./card.json');
            const cardData = JSON.parse(jsonString);
            for (const field of card.fields)
                this[field.id] = field.hasOwnProperty('load')
                    ? await field.load(cardData)
                    : cardData[field.id];
        }
    });
}

export async function buildCard(template) {
    const dom = document.createElement('div');
    dom.className = 'card-container';
    const card = initCard(dom);

    for (let modulePath of template.info.modules)
        await loadModule(modulePath, card, buildModuleUtils(modulePath));

    publishCard(card, dom);
}

export async function loadTemplates() {
    const validTemplates = [];
    const templates = await Neutralino.filesystem.readDirectory('templates');
    for (let template of templates) {
        const infoPath = './' + template.path + '/info.json';
        if (!await checkFileExists(infoPath)) continue;
        template.info = await loadJson(template.path + '/info.json');
        validTemplates.push(template);
    }
    return validTemplates;
}
