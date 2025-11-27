import { getTemplate } from './templateService.js';
import {
    bindEffects,
    initializeModules,
    loadModules,
    setupRenderPipeline
} from './moduleService.js';
import { initCardFace } from './cardFaceService.js';

async function buildSubcard(parent, key, value, subcardData) {
    const subcard = initCardFace(key);
    subcard.isSubcard = true;
    const modules = await loadModules(subcard, value || []);
    await setupRenderPipeline(subcard, modules);
    await initializeModules(subcard, modules);
    await subcard.load(subcardData);
    subcard.parent = () => parent;
    subcard.modules = () => modules;
    parent[key] = subcard;
    return subcard;
}

function buildSubcards(card, subcards, faceData) {
    if (!subcards) return [];
    return Promise.all(Object.entries(subcards).map(([key, value]) => {
        return buildSubcard(card, key, value, faceData[key] || {});
    }));
}

const templateField = () => ({
    id: 'template',
    type: 'select',
    displayName: 'Template',
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
    await face.load(faceData);
    face.subcards = await buildSubcards(face, template.subcards, faceData);
    face.parent = () => card;
    face.modules = () => modules;
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
