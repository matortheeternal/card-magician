import { registerAction } from '../../ui/systems/actionSystem.js';
import { getConfig } from '../game/gameManager.js';
import {
    openSingleFileDialog,
    saveSingleFileDialog
} from '../../shared/neutralinoAdapter.js';
import { buildCard } from '../card/cardBuilder.js';
import * as progress from '../../ui/systems/progressSystem.js';
import { withNewContext } from '../../ui/systems/objectUrlSystem.js';

const L = localize('set-manager');

const filters = [
    { name: L`Project Files`, extensions: ['cmproj'] },
    { name: L`All files`, extensions: ['*'] }
];
const cardChangedCallbacks = [];
const projectChangedCallbacks = [];

export async function saveAs() {
    log('user').info('save as');
    const filePath = await saveSingleFileDialog(
        L`Save set to file`,
        activeProject.filePath || `${activeProject.title || L`Project`}.cmproj`,
        filters
    );
    if (!filePath) return;
    try {
        log('fs').info('Saving set to:', filePath);
        await activeProject.saveAll(filePath);
        progress.complete();
    } catch (error) {
        progress.onError(error);
        log('state').error(error);
    }
}

export async function saveProject() {
    if (!activeProject.filePath) return saveAs();
    await activeProject.save();
}

export function setActiveProject(project) {
    window.activeProject = project;
    for (const callback of projectChangedCallbacks)
        callback(activeProject);
}

export async function newProject() {
    log('user').info('new project');
    await withNewContext(() => {
        window.activeProject = new activeGame.Project();
    });
}

export async function openProject(filePath) {
    log('user').info('Open project');
    filePath = filePath || await openSingleFileDialog(L`Open a project`, filters);
    if (!filePath) return;
    log('state').info('Opening project:', filePath);
    await withNewContext(async () => {
        const project = await activeGame.Project.load(filePath);
        setActiveProject(project);
    });
    await getConfig().addRecentFile(filePath);
}

export async function saveActiveCard() {
    log('state').debug('save active card');
    selectedCard.front = await activeCard.front.save();
    if (activeCard.back)
        selectedCard.back = await activeCard.back.save();
    await selectedCard.save();
    changed(activeProject, 'cards');
}

export function onActiveCardChanged(callback) {
    cardChangedCallbacks.push(callback);
}

export function onActiveProjectChanged(callback) {
    projectChangedCallbacks.push(callback);
    callback(activeProject);
}

export async function setActiveCard(card) {
    if (activeCard?.front) activeCard.front.dispose();
    if (activeCard?.back) activeCard.back.dispose();
    window.activeCard = card ? await buildCard(card) : null;
    cardChangedCallbacks.forEach(cb => cb(activeCard));
}

export async function selectCard(card) {
    window.selectedCard = card;
    await setActiveCard(card);
}

export function removeTagFromSet(tag) {
    for (const card of activeProject.cards)
        card.tags?.remove?.(tag.text);
    changed(activeCard, 'tags');
}

registerAction('add-face', faceId => {
    log('state').debug('add face', faceId);
    selectedCard[faceId] = {};
    setActiveCard(selectedCard);
});
registerAction('remove-face', faceId => {
    log('state').debug('remove face', faceId);
    delete selectedCard[faceId];
    setActiveCard(selectedCard);
});
registerAction('change-template', (faceId, newTemplateId) => {
    log('state').debug('change template', faceId, newTemplateId);
    selectedCard[faceId].template = newTemplateId;
    setActiveCard(selectedCard);
});
registerAction('open-set', openProject);
registerAction('new-set', () => {
    newProject();
    setActiveCard(null);
});
registerAction('save-set', saveProject);
registerAction('save-set-as', saveAs);
