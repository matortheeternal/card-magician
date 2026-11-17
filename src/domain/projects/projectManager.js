import { clear as clearFileWatchers } from '../../shared/fileWatcher.js';
import { flushBeforeExit } from '../../lifecycle.js';
import { executeAction, registerAction } from '../../ui/systems/actionSystem.js';
import platform from '../../shared/platformAdapter.js';
import { buildCard } from '../card/cardBuilder.js';
import {
    openContext, releaseContext, restoreContext
} from '../../ui/systems/objectUrlSystem.js';
import * as historySystem from '../../ui/systems/historySystem.js';
import RenderScheduler from '../template/renderScheduler.js';
import { hideLoading, showLoading } from '../../ui/systems/loadingService.js';
import { openModal } from '../../ui/modals/modalManager.js';

const L = localize('project-manager');
const report = createReporter({ unit: 'ProjectManager' });

const filters = [
    { name: L`Project Files`, extensions: ['cmproj'] },
    { name: L`All files`, extensions: ['*'] }
];
const cardChangedCallbacks = [];
const projectChangedCallbacks = [];

export async function saveProject(saveCards = false) {
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
    await flushBeforeExit();
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

export async function createProjectAt(filePath) {
    const project = new activeGame.Project();
    await project.setFilePath(filePath);
    await project.save();
    return project;
}

export async function createProject(filePath) {
    log('state').info('Creating project:', filePath);
    await switchProject(() => createProjectAt(filePath));
    await activeGame.config.addRecentProject();
    await setActiveEditorCard(null);
}

export function newProject() {
    log('user').info('new project');
    openModal('cm-new-project-modal', { callback: createProject });
}

export function chooseProjectFile() {
    return platform.openSingleFileDialog(L`Open a project`, filters);
}

export async function openProject(filePath) {
    log('user').info('Open project');
    filePath = filePath || await chooseProjectFile();
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
    await executeAction('start-project', filePath);
});

registerAction('new-project', newProject);

registerAction('save-project', async () => {
    await saveProject(true);
});

registerAction('select-card', selectCard);
