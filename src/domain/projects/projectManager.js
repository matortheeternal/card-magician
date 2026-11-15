import { clear as clearFileWatchers } from '../../shared/fileWatcher.js';
import { executeAction, registerAction } from '../../ui/systems/actionSystem.js';
import platform from '../../shared/platformAdapter.js';
import { buildCard } from '../card/cardBuilder.js';
import * as progress from '../../ui/systems/progressSystem.js';
import {
    openContext, releaseContext, restoreContext
} from '../../ui/systems/objectUrlSystem.js';
import * as historySystem from '../../ui/systems/historySystem.js';
import RenderScheduler from '../template/renderScheduler.js';
import { hideLoading, showLoading } from '../../ui/systems/loadingService.js';
import YAMLSerializer from './serializers/YAMLSerializer.js';

const L = localize('project-manager');
const report = createReporter({ unit: 'ProjectManager' });

const filters = [
    { name: L`Project Files`, extensions: ['cmproj'] },
    { name: L`All files`, extensions: ['*'] }
];
const cardChangedCallbacks = [];
const projectChangedCallbacks = [];

export async function saveAs() {
    log('user').info('save as');
    const filePath = await platform.saveSingleFileDialog(
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
        report('saveAs', error, [filePath, activeProject]);
        log('state').error(error);
    }
}

export async function saveProject(saveCards = false) {
    if (!activeProject.filePath) return saveAs();
    try {
        await activeProject.save();
        if (saveCards)
            await activeProject.saveCards(false);
    } catch (error) {
        report('save', error, [activeProject]);
        log('state').error(error);
    }
}

export function installProject(project) {
    clearFileWatchers();
    window.activeProject = project;
}

export function setActiveProject(project) {
    installProject(project);
    void project.watchFiles({ initial: true });
    for (const callback of projectChangedCallbacks)
        callback(activeProject);
}

export async function switchProject(createProject, activate = setActiveProject) {
    const previousContext = openContext();
    try {
        await historySystem.reset();
        const project = await createProject();
        activate(project);
        await RenderScheduler.settle().catch(() => {});
        releaseContext(previousContext);
        return project;
    } catch (error) {
        restoreContext(previousContext);
        throw error;
    }
}

export async function newProject() {
    log('user').info('new project');
    await switchProject(() => new activeGame.Project());
}

export async function openProject(filePath) {
    log('user').info('Open project');
    filePath = filePath || await platform.openSingleFileDialog(
        L`Open a project`, filters
    );
    if (!filePath) return;
    showLoading();
    try {
        log('state').info('Opening project:', filePath);
        await switchProject(() => activeGame.Project.load(filePath));
        await activeGame.config.addRecentProject();
    } finally {
        hideLoading();
    }
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
    return () => {
        const index = projectChangedCallbacks.indexOf(callback);
        if (index !== -1) projectChangedCallbacks.splice(index, 1);
    };
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
    if (window.activeEditorCard)
        changed(window.activeEditorCard, 'tags');
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
platform.onOpenFile(async filePath => {
    if (!filePath.endsWith('.cmproj')) return;
    const data = await YAMLSerializer.load(filePath);
    await executeAction('cm-select-game', data.game);
    void openProject(filePath);
});

registerAction('new-project', async () => {
    await newProject();
    await setActiveEditorCard(null);
});

registerAction('save-project', async () => {
    await saveProject(true);
});

registerAction('save-project-as', saveAs);
registerAction('select-card', selectCard);
