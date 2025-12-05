import { getTemplate } from './templateService.js';
import {
    bindEffects,
    initializeModules,
    loadModules,
    setupRenderPipeline
} from './moduleService.js';
import { initCardFace, initSubCardFace } from './cardFaceService.js';

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
    }))
})

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

export async function buildCardFace(card, key, faceData) {
    const face = initCardFace(key);
    const template = setupTemplate(face, faceData);
    const modules = await loadModules(face, template.card || []);
    await setupRenderPipeline(face, modules);
    await initializeModules(face, modules);
    face.modules = () => modules;
    face.parent = () => card;
    face.subcards = await buildSubcards(face, template.subcards, faceData);
    await face.load(faceData);
    card[key] = face;
    return face;
}

export async function buildCard(baseCard) {
    const card = {};
    const cardFaces = [];
    for (const key of Object.keys(baseCard)) {
        const cardFace = await buildCardFace(card, key, baseCard[key]);
        cardFaces.push(cardFace);
    }
    for (const cardFace of cardFaces) {
        await bindEffects(cardFace);
        for (const subcard of cardFace.subcards)
            await bindEffects(subcard);
    }
    return card;
}
