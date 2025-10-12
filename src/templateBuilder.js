import { checkFileExists, loadJson, loadModule } from './fsHelpers';
import { buildModuleUtils } from './moduleUtils.js';

function compileTemplate(context, src) {
    const parent = context.parent();
    const output = src.replaceAll('__id__', context.id);
    return parent
        ? output.replaceAll('__parentId__', parent.id)
        : output;
}

async function saveImage(data, field) {
    if (!data[field.id].image) return null;
    const response = await fetch(data[field.id]);
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to read data stream.'));
        reader.readAsDataURL(blob);
    });
}

async function loadImage(model, dataToLoad, field) {
    utils.disposeImage(model[field.id], 'image');
    const imageDataToLoad = dataToLoad[field.id];
    if (!imageDataToLoad) return null;
    const blob = utils.parseBlob(imageDataToLoad.image);
    const image = URL.createObjectURL(blob);
    return { image, filename: imageDataToLoad.filename };
}

async function saveField(data, field) {
    if (field.hasOwnProperty('save'))
        return await field.save();
    if (field.type === 'image')
        return await saveImage(data, field);
    return data[field.id];
}

async function loadField(model, dataToLoad, field) {
    if (field.hasOwnProperty('load'))
        return await field.load(dataToLoad);
    if (field.type === 'image')
        return await loadImage(model, dataToLoad, field);
    return dataToLoad[field.id];
}

function initCard(key) {
    const dom = document.createElement('div');
    dom.className = `${key}-container`;
    dom.setAttribute('x-scope', key);
    const style = document.createElement('style');
    const styles = [];
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
            styles.push(compileTemplate(this, css));
            style.innerHTML = styles.join('\n\n');
        },
        setFrame(html) {
            dom.innerHTML = compileTemplate(this, html);
            dom.prepend(style);
        },
        async save() {
            const cardData = {};
            for (const field of this.fields)
                cardData[field.id] = await saveField(this, field);
            for (const subCard of this.subCards)
                cardData[subCard.id] = await subCard.save();
            return cardData;
        },
        async load(cardData) {
            if (!cardData) return;
            for (const field of this.fields)
                this[field.id] = await loadField(this, cardData, field);
            for (const subCard of this.subCards)
                await subCard.load(cardData[subCard.id]);
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

async function buildCards(templateModel, template) {
    for (const [key, def] of Object.entries(template))
        templateModel[key] = await buildCard(templateModel, key, def);
}

export async function buildTemplate({ info }) {
    const { template } = info;
    const templateModel = {};
    await buildCards(templateModel, template);
    return templateModel;
}

const templates = [];
export async function loadTemplates() {
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
}

export function getTemplate(templateName) {
    return templates.find(t => t.info.name === templateName);
}
