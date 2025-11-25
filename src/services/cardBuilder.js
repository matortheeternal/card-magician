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

function setupTemplate(card, faceData) {
    card.fields.push(templateField());
    card.template = Alpine.store('game').defaultTemplateId;
    const templateId = faceData.template || card.template;
    const template = getTemplate(templateId);
    card.dom.setHTML(template.html);
    card.dom.addCSS(template.css);
    card.form.setHTML(template.formHTML);
    card.form.addCSS(template.formCSS);
    return template;
}

async function buildCardFace(parent, key, faceData) {
    const card = initCardFace(key);
    const template = setupTemplate(card, faceData);
    const modules = await loadModules(card, template.card || []);
    await setupRenderPipeline(card, modules);
    await initializeModules(card, modules);
    await card.load(faceData);
    card.subcards = await buildSubcards(card, template.subcards, faceData);
    card.parent = () => parent;
    card.modules = () => modules;
    parent[key] = card;
    return card;
}

export async function buildCard(baseModel) {
    const model = {};
    const cardFaces = [];
    for (const key of Object.keys(baseModel)) {
        const cardFace = await buildCardFace(model, key, baseModel[key]);
        cardFaces.push(cardFace);
    }
    for (const cardFace of cardFaces) {
        await bindEffects(cardFace);
        for (const subcard of cardFace.subcards)
            await bindEffects(subcard);
    }
    return { model };
}
