import Alpine from 'alpinejs';
import { parseBlob } from '../gfx/imageProcessing.js';

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

export function initCardFace(key) {
    const style = document.createElement('style');
    const styles = [];
    const dom = document.createElement('div');
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
            const targetElement = dom.querySelector(selector);
            targetElement.innerHTML = html;
        },
        addStyle(css) {
            styles.push(css);
            style.innerHTML = styles.join('\n\n');
        },
        setFrame(html) {
            dom.innerHTML = html;
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
        }
    });
}
