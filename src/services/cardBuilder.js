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
    await bindEffects(subcard, modules);
    return subcard;
}

function buildSubcards(card, subcards, faceData) {
    if (!subcards) return [];
    return Promise.all(Object.entries(subcards).map(([key, value]) => {
        card[key] = buildSubcard(card, key, value, faceData[key] || {});
        return card[key];
    }));
}

function setupTemplate(card, faceData) {
    card.addField({
        id: 'template',
        type: 'select',
        displayName: 'Template',
        options: Alpine.store('templates').map(t => ({
            id: t.id,
            name: t.label
        })),
        default: Alpine.store('game').defaultTemplateId,
    });
    const templateId = faceData.template || card.template;
    const template = getTemplate(templateId);
    card.setFrame(template.html);
    card.addStyle(template.css);
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
    await bindEffects(card, modules);
    parent[key] = card;
}

export async function buildCard(baseModel) {
    const model = {};
    for (const key of Object.keys(baseModel))
        await buildCardFace(model, key, baseModel[key]);
    for (const face of Object.values(model))
        face.parent = () => model;
    return { model };
}
