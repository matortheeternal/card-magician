import Alpine from 'alpinejs';
import { getTemplate } from '../template/templateRegistry.js';
import { executeAction } from '../../ui/systems/actionSystem.js';
import CardFaceModel from './CardFaceModel.js';
import SubcardModel from './SubcardModel.js';

async function buildSubcard(parent, key, modulesToLoad, subcardData) {
    const subcard = new SubcardModel(key, parent);
    parent[key] = subcard;
    await subcard.loadModules(modulesToLoad || []);
    subcard.setupRenderPipeline();
    await subcard.initializeModules();
    await subcard.load(subcardData);
    return subcard;
}

function buildSubcards(card, subcards, faceData) {
    if (!subcards) return [];
    return Promise.all(
        Object.entries(subcards).map(([key, modules]) => {
            return buildSubcard(card, key, modules, faceData[key] || {});
        })
    );
}

const templateField = () => ({
    id: 'template',
    type: 'select',
    label: 'Template',
    options: Alpine.store('templates').map(template => ({
        id: template.id,
        name: template.label
    })),
    onChange: (model, newValue) => {
        executeAction('change-template', model.id, newValue);
    }
});

function setupTemplate(face, faceData) {
    face.fields.push(templateField());
    face.template = Alpine.store('game').defaultTemplateId;
    const templateId = faceData.template || face.template;
    const template = getTemplate(templateId);
    face.dom.setHTML(template.html);
    face.dom.addCSS(template.css);
    face.form.setHTML(template.form.html);
    face.form.addCSS(template.form.css);
    face.optionsForm.setHTML(template.options.html);
    face.optionsForm.addCSS(template.options.css);
    return template;
}

export async function buildCardFace(card, key) {
    const faceDataToLoad = card[key];
    const cardFace = new CardFaceModel(key);
    card[key] = cardFace;
    const template = setupTemplate(cardFace, faceDataToLoad);
    await cardFace.loadModules(template.card || []);
    cardFace.setupRenderPipeline();
    await cardFace.initializeModules();
    cardFace.parent = () => card;
    cardFace.subcards = await buildSubcards(cardFace, template.subcards, faceDataToLoad);
    await cardFace.load(faceDataToLoad);
    return cardFace;
}

export function getFaceKeys(baseCard) {
    return ['front', 'back'].filter(key => Object.hasOwn(baseCard, key));
}

function bindWatchers(cardFaces) {
    for (const cardFace of cardFaces) {
        cardFace.bindWatchers();
        for (const subcard of cardFace.subcards) {
            subcard.bindWatchers();
            changed(subcard);
        }
        changed(cardFace);
    }
}

export async function buildCard(baseCard) {
    const card = Object.assign({}, baseCard);
    const cardFaces = [];
    for (const key of getFaceKeys(baseCard)) {
        const cardFace = await buildCardFace(card, key);
        cardFaces.push(cardFace);
    }
    bindWatchers(cardFaces);
    return card;
}
