import { clear as clearFileWatchers } from '../../shared/fileWatcher.js';
import { flushBeforeExit } from '../../lifecycle.js';
import { executeAction, registerAction } from '../../ui/systems/actionSystem.js';
import platform from '../../shared/platformAdapter.js';
import { buildCard, getFaceKeys } from '../card/cardBuilder.js';
import {
    openContext, releaseContext, restoreContext
} from '../../ui/systems/objectUrlSystem.js';
import * as historySystem from '../../ui/systems/historySystem.js';
import RenderScheduler from '../template/renderScheduler.js';
import { hideLoading, showLoading } from '../../ui/systems/loadingService.js';
import { openModal } from '../../ui/modals/modalManager.js';
import { watch } from '../../shared/reactivity.js';
import { AUTO_TEMPLATE } from '../template/autoTemplate.js';
import { resolveFaceTemplate } from '../template/templateRegistry.js';

const L = localize('project-manager');
const report = createReporter({ unit: 'ProjectManager' });

const filters = [
    { name: L`Project Files`, extensions: ['cmproj'] },
    { name: L`All files`, extensions: ['*'] }
];
const cardChangedCallbacks = [];
const projectChangedCallbacks = [];
let unwatchActiveCards = () => {};

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
    unwatchActiveCards();
    window.activeProject = project;
    unwatchActiveCards = watch(project, 'cards', () => project.afterCardsChanged());
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

async function saveFace(face, previousData) {
    const saved = await face.save();
    const preserveInactiveFields = saved.template === AUTO_TEMPLATE
        || previousData?.template === AUTO_TEMPLATE;
    return preserveInactiveFields ? { ...previousData, ...saved } : saved;
}

export async function saveCard(editorCard, projectCard) {
    log('state').debug('save card');
    for (const key of getFaceKeys(editorCard))
        projectCard[key] = await saveFace(editorCard[key], projectCard[key]);
    const ignored = editorCard.ignoredInspections;
    if (ignored?.length) projectCard.ignoredInspections = ignored;
    if (ignored?.length === 0) delete projectCard.ignoredInspections;
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

function disposeEditorCard(editor) {
    if (!editor) return;
    for (const key of getFaceKeys(editor)) editor[key].dispose();
}

async function installEditorCard(editor) {
    disposeEditorCard(window.activeEditorCard);
    window.activeEditorCard = editor;
    for (const cb of cardChangedCallbacks) await cb(editor);
}

export async function setActiveEditorCard(card) {
    await installEditorCard(card ? await buildCard(card) : null);
}

export function needsAutoTemplateRefresh(editorFace, face = editorFace) {
    return face?.template === AUTO_TEMPLATE
        && editorFace.resolvedTemplate !== resolveFaceTemplate(face);
}

export async function refreshAutoTemplate(card, isSaveCurrent = () => true) {
    const editor = window.activeEditorCard;
    const isCurrent = () => window.selectedProjectCard === card
        && window.activeEditorCard === editor
        && isSaveCurrent();
    if (editor?.baseCard !== card || !isCurrent()) return;
    const needsRefresh = getFaceKeys(editor)
        .some(key => needsAutoTemplateRefresh(editor[key], card[key]));
    if (!needsRefresh) return;
    const updated = await buildCard(card);
    if (!isCurrent()) return disposeEditorCard(updated);
    await installEditorCard(updated);
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
