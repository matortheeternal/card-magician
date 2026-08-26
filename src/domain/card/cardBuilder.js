import { getTemplate, getTemplates } from '../template/templateRegistry.js';
import { executeAction } from '../../ui/systems/actionSystem.js';
import CardFaceModel from './CardFaceModel.js';
import SubcardModel from './SubcardModel.js';

async function buildSubcard(parent, key, template, modulesToLoad, subcardData) {
    const subcard = new SubcardModel(key, parent);
    parent[key] = subcard;
    await subcard.loadModules(modulesToLoad || []);
    subcard.setupRenderPipeline();
    await subcard.initializeModules(template, parent);
    await subcard.load(subcardData);
    return subcard;
}

function buildSubcards(card, template, faceData) {
    if (!template.subcards) return [];
    return Promise.all(
        Object.entries(template.subcards).map(([key, modules]) => {
            return buildSubcard(card, key, template, modules, faceData[key] || {});
        })
    );
}

const templateField = () => ({
    id: 'template',
    type: 'select',
    label: 'Template',
    options: getTemplates().map(template => ({
        id: template.id,
        name: template.label
    })),
    onChange: (model, newValue) => {
        executeAction('change-template', model.id, newValue);
    }
});

function setupTemplate(face, faceData) {
    face.fields.push(templateField());
    faceData.template ??= activeGame.defaultTemplateId;
    const template = getTemplate(faceData.template);
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
    await cardFace.initializeModules(template);
    cardFace.parent = () => card;
    cardFace.subcards = await buildSubcards(cardFace, template, faceDataToLoad);
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
