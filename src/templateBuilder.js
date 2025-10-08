import { checkFileExists, loadJson, loadModule } from './fsHelpers';
import { buildModuleUtils } from './moduleUtils.js';

function compileTemplate(context, src) {
    const parent = context.parent();
    const output = src.replaceAll('__id__', context.id);
    return parent
        ? output.replaceAll('__parentId__', parent.id)
        : output;
}

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
            this[field.id] = field.default || '';
        },
        publishElement(selector, html) {
            const targetElement = dom.querySelector(`.${key}-${selector}`);
            targetElement.innerHTML = compileTemplate(this, html);
        },
        addStyle(css) {
            const styleFragment = document.createElement('style');
            styleFragment.innerHTML = compileTemplate(this, css);
            dom.prepend(styleFragment);
        },
        setFrame(html) {
            dom.innerHTML = compileTemplate(this, html);
        },
        async save() {
            const cardData = {};
            for (const field of this.fields)
                cardData[field.id] = field.hasOwnProperty('save')
                    ? await field.save()
                    : this[field.id];
            for (const subCard of this.subCards) {
                cardData[subCard.id] = await subCard.save();
            }
            return cardData;
        },
        async load(cardData) {
            for (const field of this.fields)
                this[field.id] = field.hasOwnProperty('load')
                    ? await field.load(cardData)
                    : cardData[field.id];
            for (const subCard of this.subCards) {
                await subCard.load(cardData[subCard.id]);
            }
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

async function buildCard(parent, key, def) {
    const card = initCard(key);
    card.parent = () => parent;
    if (parent.subCards) parent.subCards.push(Alpine.raw(card));

    const components = Array.isArray(def) ? def : def.components;
    for (let component of components) {
        const loader = getComponentLoader(component);
        await loader.load(card, component);
    }

    if (def.target) {
        const el = parent.dom.querySelector(`.${parent.id}-${def.target}`);
        el.replaceWith(card.dom);
    }

    return card;
}

async function buildCards(cardNamespace, template) {
    for (const [key, def] of Object.entries(template))
        cardNamespace[key] = await buildCard(cardNamespace, key, def);
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
