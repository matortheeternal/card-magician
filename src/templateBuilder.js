import { checkFileExists, loadJson, loadModule } from './fsHelpers';
import { buildModuleUtils } from './moduleUtils.js';
import { parseBlob } from './gfx/imageProcessing.js';

function compileTemplate(context, src) {
    const parent = context.parent && context.parent();
    const output = src.replaceAll('__id__', context.id);
    return parent
        ? output.replaceAll('__parentId__', parent.id)
        : output;
}

const imageKeys = ['filename', 'xOffset', 'yOffset', 'width', 'height'];
function imageFields(obj) {
    return imageKeys.reduce((acc, key) => {
        if (key in obj) acc[key] = obj[key];
        return acc;
    }, {});
}

async function saveImage(data, field) {
    const imageUrl = data[field.id]?.image;
    if (!imageUrl) return { image: null, filename: '' };
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({
            image: reader.result,
            ...imageFields(data[field.id])
        });
        reader.onerror = () => reject(new Error('Failed to read data stream.'));
        reader.readAsDataURL(blob);
    });
}

async function loadImage(model, dataToLoad, field) {
    const currentImage = model[field.id]?.image;
    if (currentImage) URL.revokeObjectURL(currentImage);
    const imageDataToLoad = dataToLoad[field.id];
    if (!imageDataToLoad?.image) return { image: null, filename: '' };
    const blob = parseBlob(imageDataToLoad.image);
    const image = URL.createObjectURL(blob);
    return { image, ...imageFields(imageDataToLoad) };
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

function createFormGroup(form, groupName) {
    const group = { groupName, isGroup: true, fields: [] };
    form.push(group);
    return group;
}

function getFormContainer(form, field) {
    if (!field.group) return form;
    const group = form.find(entry => {
        return entry.isGroup && entry.groupName === field.group;
    }) || createFormGroup(form, field.group);
    return group.fields;
}

function initCardFace(key) {
    const dom = document.createElement('div');
    dom.className = `${key}-container`;
    const style = document.createElement('style');
    const styles = [];
    return Alpine.reactive({
        id: key,
        dom,
        subCards: [],
        fields: [],
        form: [],
        addField(field) {
            this.fields.push(field);
            this[field.id] = field.default || '';
            const formContainer = getFormContainer(this.form, field);
            formContainer.push(field);
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
                if (cardData.hasOwnProperty(field.id))
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
        load: async (card, component) => {
            const utils = buildModuleUtils(component);
            return await loadModule(component, card, utils);
        }
    },
    {
        type: 'card',
        useLoader: component => component.constructor === Object,
        load: buildCardFaces
    }
];

function getComponentLoader(component) {
    return componentLoaders.find(loader => loader.useLoader(component));
}

async function buildCardFace(parent, key, def) {
    const card = initCardFace(key);
    if (parent.subCards) {
        card.parent = () => parent;
        parent.subCards.push(Alpine.raw(card));
    }

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

async function buildCardFaces(model, template) {
    for (const [key, def] of Object.entries(template))
        model[key] = await buildCardFace(model, key, def);
    Object.keys(template).forEach(key => {
        model[key].parent = () => model;
    });
}

export async function buildCard(templateId) {
    const template = getTemplate(templateId);
    const model = {};
    await buildCardFaces(model, template.structure);
    return { template: template.id, model };
}

export function remapFaces(card, oldTemplateId, newTemplateId) {
    const oldTemplate = getTemplate(oldTemplateId);
    const newTemplate = getTemplate(newTemplateId);
    const oldKeys = Object.keys(oldTemplate.structure);
    const newKeys = Object.keys(newTemplate.structure);
    const size = Math.min(oldKeys.length, newKeys.length);
    for (let i = 0; i < size; i++) {
        card.model[newKeys[i]] = card.model[oldKeys[i]];
        delete card.model[oldKeys[i]];
    }
}

const templates = [];
export async function loadTemplates() {
    const templateFolders = await Neutralino.filesystem.readDirectory(
        'templates',
        { recursive: true }
    );
    for (let templateFolder of templateFolders) {
        console.info('Reading template from', templateFolder.path);
        const jsonPath = ['.', templateFolder.path, 'template.json'].join('/');
        if (!await checkFileExists(jsonPath)) {
            console.info('No template.json found at', jsonPath);
            continue;
        }
        const template = await loadJson(jsonPath)
        templates.push(template);
    }
}

export function getTemplate(templateId) {
    return templates.find(t => t.id === templateId);
}

export function getTemplates() {
    return templates.slice();
}
