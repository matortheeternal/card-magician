import { getActiveGame } from '../../game/gameManager.js';
import { openFolderDialog } from '../../../shared/neutralinoAdapter.js';
import { findMatchingImporter } from './cardImporterRegistry.js';
import { registerAction } from '../../../ui/systems/actionSystem.js';
import { setActiveSet } from '../../sets/setManager.js';
import { loadMseFile } from './loadMseFile.js';
import { openModal } from '../../../ui/modals/modalManager.js';
import * as progress from '../../../ui/systems/progressSystem.js';

const L = localize('import-mse');

function checkVersion(mseVersion) {
    if (mseVersion !== '2.0.2')
        return `Untested MSE version "${mseVersion}"`;
}

function checkGame(mseGame, mseGameVersion) {
    if (mseGame !== 'magic')
        throw new Error('Import only supports Magic: The Gathering sets.');
    if (mseGameVersion !== '2024-10-01')
        return `Untested MSE game version "${mseGameVersion}"`;
}

function checkStylesheet(mseStylesheet, mseStylesheetVersion) {
    if (mseStylesheet !== 'm15-altered')
        return `Set has unrecognized base stylesheet ${mseStylesheet}`;
    if (mseStylesheetVersion !== '2024-09-23')
        return `Untested m15-altered stylesheet version ${mseStylesheetVersion}`;
}

function verifySet(mseSet) {
    progress.setOperation('Verifying MSE set file');
    const versionWarning = checkVersion(mseSet.mse_version);
    const gameWarning = checkGame(mseSet.game, mseSet.game_version);
    const styleWarning = checkStylesheet(mseSet.stylesheet, mseSet.stylesheet_version);
    const combinedWarning = [versionWarning, gameWarning, styleWarning]
        .filter(Boolean)
        .map(str => `  ${str}`)
        .join('\n');
    if (!combinedWarning) return true;
    return confirm(
        `Warning: This is an experimental feature. `
        + `The provided MSE Set file has the following untested values. `
        + `Imported may fail or be incomplete.\n\n${combinedWarning}`
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
    const cardImporter = findMatchingImporter(mseSet, mseCard.card, cmCard, folderPath);
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
    const game = getActiveGame();
    const cmSet = game.newSet();
    progress.setStatus('Loading MSE set file');
    const mseSet = await loadMseFile(folderPath, 'set');
    if (!verifySet(mseSet)) return;
    progress.setMax(mseSet.include_file.length);
    progress.setStatus('Loading set info');
    importSetInfo(mseSet.set_info, cmSet);
    progress.setStatus('Importing cards');
    await importCards(mseSet, cmSet, game, folderPath);
    return cmSet;
}

registerAction('import-mse-set', async () => {
    log('user').info('Import MSE set');
    const folderPath = await openFolderDialog(L`Import an MSE Set`);
    if (!folderPath) return;
    log('state').info('Importing MSE set:', folderPath);
    openModal('cm-progress-modal', { title: 'Importing...' });
    try {
        const set = await importMseFolder(folderPath);
        progress.complete();
        if (set) setActiveSet(set);
    } catch (error) {
        progress.onError(error);
        log('user').error('Error importing MSE set', error);
    }
});
