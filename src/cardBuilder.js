import {checkFileExists, getImageUrl, loadFont, loadJson, loadModule} from './fsHelpers';
import { maskImage, parseBlob, loadImage, canvasToObjectURL } from './gfx/imageProcessing';
import { combineBlend } from './gfx/blending';
import { buildForm } from './formBuilder';

export async function buildCard(template) {
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
        disposeImage(card, key) {
            if (!card[key]) return;
            URL.revokeObjectURL(card[key]);
        },
        parseBlob(text) {
            return parseBlob(text);
        },
        async combineBlend(imgUrl1, imgUrl2, mode = 'symmetricOverlay') {
            if (!imgUrl2) return imgUrl1;
            const img1 = await loadImage(imgUrl1);
            const img2 = await loadImage(imgUrl2);
            const result = combineBlend(img1, img2, mode);
            return await canvasToObjectURL(result);
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
    const button = document.createElement('button');
    button.textContent = 'Save';
    button.setAttribute('type', 'button');
    button.setAttribute('x-on:click', 'await save()');
    form.appendChild(button);
    const loadButton = document.createElement('button');
    loadButton.textContent = 'Load';
    loadButton.setAttribute('type', 'button');
    loadButton.setAttribute('x-on:click', 'await load()');
    form.appendChild(loadButton);
    const main = document.querySelector('main');
    main.innerHTML = '';
    main.setAttribute('x-data', 'card');
    main.appendChild(dom);
    main.appendChild(form);
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
