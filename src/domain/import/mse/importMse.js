import { openFolderDialog } from '../../../shared/neutralinoAdapter.js';
import { createImporter } from './cardImporterRegistry.js';
import { registerAction } from '../../../ui/systems/actionSystem.js';
import { setActiveProject } from '../../projects/projectManager.js';
import { loadMseFile } from './loadMseFile.js';
import { openModal } from '../../../ui/modals/modalManager.js';
import * as progress from '../../../ui/systems/progressSystem.js';
import { withNewContext } from '../../../ui/systems/objectUrlSystem.js';

const L = localize('import-mse');

const TESTED_MSE_VERSION = '2.0.2';
const TESTED_MSE_GAME = 'magic';
const TESTED_MSE_GAME_VERSION = '2024-10-01';
const TESTED_STYLESHEET = 'm15-altered';
const TESTED_STYLESHEET_VERSION = '2024-09-23';

function checkVersion(mseVersion) {
    if (mseVersion !== TESTED_MSE_VERSION)
        return L`Untested MSE version "${mseVersion}"`;
}

function checkGame(mseGame, mseGameVersion) {
    if (mseGame !== TESTED_MSE_GAME)
        throw new Error('Import only supports Magic: The Gathering projects.');
    if (mseGameVersion !== TESTED_MSE_GAME_VERSION)
        return L`Untested MSE game version "${mseGameVersion}"`;
}

function checkStylesheet(mseStylesheet, mseStylesheetVersion) {
    if (mseStylesheet !== TESTED_STYLESHEET)
        return L`Set has unrecognized base stylesheet ${mseStylesheet}`;
    if (mseStylesheetVersion !== TESTED_STYLESHEET_VERSION)
        return L`Untested m15-altered stylesheet version ${mseStylesheetVersion}`;
}

function verifySet(mseSet) {
    progress.setOperation(L`Verifying MSE set file`);
    const versionWarning = checkVersion(mseSet.mse_version);
    const gameWarning = checkGame(mseSet.game, mseSet.game_version);
    const styleWarning = checkStylesheet(mseSet.stylesheet, mseSet.stylesheet_version);
    const combinedWarning = [versionWarning, gameWarning, styleWarning]
        .filter(Boolean)
        .map(str => `  ${str}`)
        .join('\n');
    if (!combinedWarning) return true;
    return confirm(
        L`Warning: This is an experimental feature.
        The provided MSE Set file has the following untested values.
        Imported may fail or be incomplete.`
        + `\n\n${combinedWarning}`
    );
}

const setInfoImporters = {
    title: (value, cmSet) => cmSet.title = value,
    artist: (value, cmSet) => cmSet.illustrator = value,
    copyright: (value, cmSet) => cmSet.legalText = value,
    set_code: (value, cmSet) => cmSet.setCode = value,
    set_language: (value, cmSet) => cmSet.language = value,
};

function isEmptyObject(obj) {
    return obj && typeof obj === 'object' && Object.keys(obj).length === 0;
}

function importSetInfo(mseInfo, cmSet) {
    for (const key of Object.keys(mseInfo)) {
        progress.setOperation(key);
        const value = mseInfo[key];
        if (isEmptyObject(value)) continue;
        setInfoImporters[key]?.(value, cmSet);
    }
}

async function importCard(filename, game, folderPath, mseSet) {
    const cmCard = game.newCard();
    const mseCard = await loadMseFile(folderPath, filename);
    const cardImporter = createImporter(mseSet, mseCard.card, cmCard, folderPath);
    await cardImporter.import();
    return cmCard;
}

async function importCards(mseSet, cmSet, game, folderPath) {
    const cardFiles = mseSet.include_file;
    for (const fileName of cardFiles) {
        progress.setOperation(fileName);
        const cmCard = await importCard(fileName, game, folderPath, mseSet);
        cmSet.cards.push(cmCard);
        progress.increment();
    }
}

export async function importMseFolder(folderPath) {
    const project = new activeGame.Project();
    progress.setStatus(L`Loading MSE set file`);
    const mseSet = await loadMseFile(folderPath, 'set');
    if (!verifySet(mseSet)) return;
    progress.setMax(mseSet.include_file.length);
    progress.setStatus(L`Loading set info`);
    importSetInfo(mseSet.set_info, project);
    progress.setStatus(L`Importing cards`);
    await importCards(mseSet, project, activeGame, folderPath);
    return project;
}

registerAction('import-mse-set', async () => {
    log('user').info('Import MSE set');
    const folderPath = await openFolderDialog(L`Import an MSE Set`);
    if (!folderPath) return;
    log('state').info('Importing MSE set:', folderPath);
    openModal('cm-progress-modal', { title: L`Importing...` });
    try {
        await withNewContext(async () => {
            const project = await importMseFolder(folderPath);
            progress.setTitle(L`Import complete!`);
            progress.complete();
            setActiveProject(project);
        });
    } catch (error) {
        progress.onError(error);
        log('user').error('Error importing MSE set', error);
    }
});
