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

class DOMBuilder {
    root = document.createElement('div');
    style = document.createElement('style');
    styles = [];

    setHTML(html) {
        this.root.innerHTML = html;
        this.root.prepend(this.style);
    }

    addCSS(css) {
        this.styles.push(css);
        this.style.innerHTML = this.styles.join('\n\n');
    }
}

export function initCardFace(key) {
    return Alpine.reactive({
        id: key,
        dom: new DOMBuilder(),
        form: new DOMBuilder(),
        optionsForm: new DOMBuilder(),
        subCards: [],
        fields: [],
        options: [],
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
