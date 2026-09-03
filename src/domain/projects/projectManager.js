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
        L`Save project to file`,
        activeProject.filePath || `${activeProject.title || L`Project`}.cmproj`,
        filters
    );
    if (!filePath) return;
    try {
        log('fs').info('Saving project to:', filePath);
        await activeProject.setFilePath(filePath);
        await activeProject.saveAll(filePath);
        progress.complete();
    } catch (error) {
        progress.onError(error);
        log('state').error(error);
    }
}

export async function saveProject(saveCards = false) {
    if (!activeProject.filePath) return saveAs();
    await activeProject.save();
    if (saveCards)
        await activeProject.saveCards(false);
}

export function setActiveProject(project) {
    window.activeProject = project;
    for (const callback of projectChangedCallbacks)
        callback(activeProject);
}

export async function newProject() {
    log('user').info('new project');
    await withNewContext(() => {
        const project = new activeGame.Project();
        setActiveProject(project);
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

export async function saveCard(editorCard, projectCard) {
    log('state').debug('save card');
    projectCard.front = await editorCard.front.save();
    if (editorCard.back)
        projectCard.back = await editorCard.back.save();
    await projectCard.save();
    changed(window.activeProject, 'cards');
}

export function onActiveCardChanged(callback) {
    cardChangedCallbacks.push(callback);
}

export function onActiveProjectChanged(callback) {
    projectChangedCallbacks.push(callback);
    callback(window.activeProject);
}

export async function setActiveEditorCard(card) {
    if (window.activeEditorCard?.front) activeEditorCard.front.dispose();
    if (window.activeEditorCard?.back) activeEditorCard.back.dispose();
    window.activeEditorCard = card ? await buildCard(card) : null;
    for (const cb of cardChangedCallbacks)
        await cb(activeEditorCard);
}

export async function selectCard(card) {
    window.selectedProjectCard = card;
    await setActiveEditorCard(card);
}

export function removeTagFromSet(tag) {
    for (const card of activeProject.cards)
        card.tags?.remove?.(tag.text);
    changed(activeEditorCard, 'tags');
}

registerAction('add-face', async faceId => {
    log('state').debug('add face', faceId);
    selectedProjectCard[faceId] = {};
    await setActiveEditorCard(selectedProjectCard);
});

registerAction('remove-face', async faceId => {
    log('state').debug('remove face', faceId);
    delete selectedProjectCard[faceId];
    await setActiveEditorCard(selectedProjectCard);
});

registerAction('change-template', async (faceId, newTemplateId) => {
    log('state').debug('change template', faceId, newTemplateId);
    selectedProjectCard[faceId].template = newTemplateId;
    await setActiveEditorCard(selectedProjectCard);
});

registerAction('open-project', openProject);

registerAction('new-project', async () => {
    await newProject();
    await setActiveEditorCard(null);
});

registerAction('save-project', async () => {
    await saveProject(true);
});

registerAction('save-project-as', saveAs);
registerAction('select-card', selectCard);
