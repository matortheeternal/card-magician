import { checkFileExists, loadJson, loadModule } from './fsHelpers';
import { buildModuleUtils } from './moduleUtils.js';

function initCard(key) {
    const dom = document.createElement('div');
    dom.className = `${key}-container`;
    dom.setAttribute('x-scope', key);
    return Alpine.reactive({
        id: key,
        dom,
        subCards: [],
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

const componentLoaders = [
    {
        type: 'module',
        useLoader: component => component.constructor === String,
        load: (card, component) => {
            const utils = buildModuleUtils(component);
            return loadModule(component, card, utils);
        }
    },
    {
        type: 'card',
        useLoader: component => component.constructor === Object,
        load: buildCards
    }
];

function getComponentLoader(component) {
    return componentLoaders.find(loader => loader.useLoader(component));
}

async function buildCard(cardNamespace, key, components) {
    const card = initCard(key);
    card.parent = () => cardNamespace;
    if (cardNamespace.subCards) cardNamespace.subCards.push(card);
    for (let component of components) {
        const loader = getComponentLoader(component);
        await loader.load(card, component);
    }
    return card;
}

async function buildCards(cardNamespace, template) {
    for (const [key, components] of Object.entries(template))
        cardNamespace[key] = await buildCard(cardNamespace, key, components);
}

export async function buildTemplate({ info }) {
    const { template } = info;
    const cardNamespace = {};
    await buildCards(cardNamespace, template);
    return cardNamespace;
}

export async function loadTemplates() {
    const templates = [];
    const templateFolders = await Neutralino.filesystem.readDirectory(
        'templates',
        { recursion: true }
    );
    for (let templateFolder of templateFolders) {
        console.info('Reading template from', templateFolder.path);
        const infoPath = ['.', templateFolder.path, 'info.json'].join('/');
        if (!await checkFileExists(infoPath)) {
            console.info('No info.json found at', infoPath)
            continue;
        }
        const template = {};
        template.info = await loadJson(infoPath);
        templates.push(template);
    }
    return templates;
}
