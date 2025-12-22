import Alpine from 'alpinejs';
import { getTemplate } from '../template/templateRegistry.js';
import {
    bindEffects,
    initializeModules,
    loadModules,
    setupRenderPipeline
} from '../template/moduleEngine.js';
import { executeAction } from '../../ui/systems/actionSystem.js';
import CardFaceModel from './CardFaceModel.js';
import SubcardModel from './SubcardModel.js';

export function initCardFace(key) {
    return Alpine.reactive(new CardFaceModel(key));
}

export function initSubCardFace(key) {
    return Alpine.reactive(new SubcardModel(key));
}

async function buildSubcard(parent, key, modulesToLoad, subcardData) {
    const subcard = initSubCardFace(key);
    const modules = await loadModules(subcard, modulesToLoad || []);
    await setupRenderPipeline(subcard, modules);
    await initializeModules(subcard, modules, parent);
    subcard.modules = () => modules;
    subcard.parent = () => parent;
    await subcard.load(subcardData);
    parent[key] = subcard;
    return subcard;
}

function buildSubcards(card, subcards, faceData) {
    if (!subcards) return [];
    return Promise.all(Object.entries(subcards).map(([key, modules]) => {
        return buildSubcard(card, key, modules, faceData[key] || {});
    }));
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
    const face = initCardFace(key);
    const template = setupTemplate(face, card[key]);
    const modules = await loadModules(face, template.card || []);
    await setupRenderPipeline(face, modules);
    await initializeModules(face, modules);
    face.modules = () => modules;
    face.parent = () => card;
    face.subcards = await buildSubcards(face, template.subcards, card[key]);
    await face.load(card[key]);
    card[key] = face;
    return face;
}

export function getFaceKeys(baseCard) {
    return ['front', 'back'].filter(key => baseCard.hasOwnProperty(key));
}

export async function buildCard(baseCard) {
    const card = Object.assign({}, baseCard);
    const cardFaces = [];
    for (const key of getFaceKeys(baseCard)) {
        const cardFace = await buildCardFace(card, key);
        cardFaces.push(cardFace);
    }
    for (const cardFace of cardFaces) {
        await bindEffects(cardFace);
        for (const subcard of cardFace.subcards)
            await bindEffects(subcard);
    }
    return card;
}
