import platform from '../../../shared/platformAdapter.js';
import { flushBeforeExit } from '../../../lifecycle.js';
import { registerAction } from '../../../ui/systems/actionSystem.js';
import { openModal } from '../../../ui/modals/modalManager.js';
import * as progress from '../../../ui/systems/progressSystem.js';
import { switchProject } from '../../projects/projectManager.js';
import { importMseFile, MSE_GAME } from './importMse.js';

const L = localize('import-mse');
const report = createReporter({ unit: 'ImportMSE', label: 'MSE Set Importer' });

async function runImport(filePath, saveImport) {
    log('state').info('Importing MSE set:', filePath);
    openModal('cm-progress-modal', { title: L`Importing...`, capturesHotkeys: true });
    try {
        const [numCards, failures] = await saveImport();
        progress.setTitle(L`Import complete!`);
        progress.complete();
        if (failures.length) {
            const numFails = failures.length;
            progress.setTitle(L`Import partially complete`);
            progress.setStatus(L`Imported ${numCards} cards; ${numFails} cards failed.`);
            progress.setOperation(L`Skipped entries are listed in the error report.`);
        }
    } catch (error) {
        progress.onError(error);
        report('import', error, [filePath]);
        log('user').error('Error importing MSE set', error);
    }
}

async function saveNewProject(project, projectPath) {
    progress.setStatus(L`Saving project`);
    await project.setFilePath(projectPath);
    await project.saveAll(projectPath);
}

async function openInWorkspace(createProject, saveProject) {
    const project = await switchProject(createProject);
    await saveProject(project);
    await activeGame.config.addRecentProject();
}

async function importNewProject(filePath, projectPath, openProject) {
    let result;
    await openProject(async () => {
        result = await importMseFile(filePath);
        return result[0];
    }, project => saveNewProject(project, projectPath));
    const [project, failures] = result;
    return [project.cards.length, failures];
}

async function chooseImportLocation(filePath, openProject) {
    const { stem } = await platform.getPathParts(filePath);
    openModal('cm-new-project-modal', {
        title: L`Import an MSE Set`,
        name: stem,
        confirmLabel: L`Import`,
        callback: projectPath => runImport(filePath, () => {
            return importNewProject(filePath, projectPath, openProject);
        })
    });
}

async function importIntoProject(filePath, project) {
    await flushBeforeExit();
    const [imported, failures, setInfo] = await importMseFile(filePath);
    const wasEmpty = project.cards.length === 0;
    progress.setStatus(L`Saving cards`);
    progress.setMax(imported.cards.length);
    try {
        for (const card of imported.cards) {
            await card.save(true);
            project.cards.push(card);
            progress.increment();
        }
    } finally {
        changed(project, 'cards');
    }
    if (wasEmpty) {
        Object.assign(project, setInfo);
        if (setInfo.symbol) await project.saveSymbol();
        await project.save();
        changed(project, Object.keys(setInfo));
        await activeGame.config.addRecentProject();
    }
    return [imported.cards.length, failures];
}

function chooseDestination(project) {
    if (!project) return 'new';
    if (!project.cards.length) return 'current';
    const message = L`This project already has cards. Where should the import go?`;
    return dialog.choose(message, {
        title: L`Import an MSE Set`,
        choices: [
            { label: L`Add to current project`, value: 'current' },
            { label: L`Create a new project`, value: 'new' }
        ]
    });
}

export async function chooseMseImport(openProject = openInWorkspace, project = null) {
    log('user').info('Import MSE set');
    const filePath = await platform.openSingleFileDialog(L`Import an MSE Set`, [
        { name: L`MSE Set Files`, extensions: ['mse-set'] }
    ]);
    if (!filePath) return;
    const destination = await chooseDestination(project);
    if (destination === 'new') return chooseImportLocation(filePath, openProject);
    if (destination === 'current')
        return runImport(filePath, () => importIntoProject(filePath, project));
}

registerAction('import-mse-set', () => {
    if (activeGame.id !== MSE_GAME)
        return dialog.alert(L`MSE import requires a Magic: The Gathering project.`);
    return chooseMseImport(openInWorkspace, activeProject);
});
