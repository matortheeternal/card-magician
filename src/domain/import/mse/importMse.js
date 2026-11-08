import platform from '../../../shared/platformAdapter.js';
import { createImporter } from './cardImporterRegistry.js';
import { registerAction } from '../../../ui/systems/actionSystem.js';
import { setActiveProject } from '../../projects/projectManager.js';
import { openModal } from '../../../ui/modals/modalManager.js';
import * as progress from '../../../ui/systems/progressSystem.js';
import { withNewContext } from '../../../ui/systems/objectUrlSystem.js';
import MseFileAdapter from './MseFileAdapter.js';
import { getStructure } from './cardStructureRegistry.js';
import convertSetSymbol from './setSymbol/convertSetSymbol.js';

const L = localize('import-mse');
const report = createReporter({ unit: 'ImportMSE', label: 'MSE Set Importer' });

const TESTED_MSE_VERSION = '2.6.0';
const TESTED_MSE_GAME = 'magic';
const TESTED_MSE_GAME_VERSION = '2026-09-06';
const TESTED_STYLESHEET = 'm15-altered';
const TESTED_STYLESHEET_VERSION = '2026-09-06';

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

async function verifySet(mseSet) {
    progress.setOperation(L`Verifying MSE set file`);
    const versionWarning = checkVersion(mseSet.mse_version);
    const gameWarning = checkGame(mseSet.game, mseSet.game_version);
    const styleWarning = checkStylesheet(mseSet.stylesheet, mseSet.stylesheet_version);
    const combinedWarning = [versionWarning, gameWarning, styleWarning]
        .filter(Boolean)
        .map(str => `  ${str}`)
        .join('\n');
    if (!combinedWarning) return true;
    return dialog.confirm(
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
    symbol: async (value, cmSet, adapter) => {
        if (!value) return;
        try {
            cmSet.symbol = convertSetSymbol(await adapter.entryText(value));
        } catch (error) {
            const message = L`Failed to import set symbol "${value}", using default`;
            log('user').warn(message, error);
        }
    },
};

function isEmptyObject(obj) {
    return obj && typeof obj === 'object' && Object.keys(obj).length === 0;
}

async function importSetInfo(mseInfo, cmSet, adapter) {
    for (const key of Object.keys(mseInfo)) {
        progress.setOperation(key);
        const value = mseInfo[key];
        if (isEmptyObject(value)) continue;
        await setInfoImporters[key]?.(value, cmSet, adapter);
    }
}

export async function importCard(mseSet, mseCard, adapter, onFailure = () => {}) {
    try {
        const cmCard = new activeGame.Card();
        const importer = createImporter(mseSet, mseCard, cmCard, adapter);
        await importer.import();
        return cmCard;
    } catch (error) {
        onFailure(error, mseCard.name);
        return null;
    }
}

export async function importCards(mseSet, adapter, onFailure = () => {}) {
    const cardMap = new Map();
    for (const mseCard of mseSet.card) {
        progress.setOperation(mseCard.name);
        const cmCard = await importCard(mseSet, mseCard, adapter, onFailure);
        if (cmCard) cardMap.set(mseCard, cmCard);
        progress.increment();
    }
    return cardMap;
}

export function addCardsToProject(cardMap, project, onFailure = () => {}) {
    const cardsByUid = new Map();
    for (const [mseCard, cmCard] of cardMap)
        if (mseCard.uid) cardsByUid.set(mseCard.uid, cmCard);

    for (const [mseCard, cmCard] of cardMap) {
        try {
            const structure = getStructure(mseCard, cmCard, cardsByUid);
            const card = structure.makeCard();
            if (card) project.cards.push(card);
        } catch (error) {
            onFailure(error, mseCard.name);
        }
    }
}

function makeFailureReporter(filePath, failures) {
    return (error, cardName) => {
        report('import-card', error, { filePath, cardName });
        log('user').warn('Skipped MSE card', cardName, error);
        failures.push({ cardName, error });
    };
}

export async function importMseFile(filePath) {
    const failures = [];
    const project = new activeGame.Project();
    progress.setStatus(L`Loading MSE set file`);
    const adapter = await MseFileAdapter.load(filePath);
    const mseSet = await adapter.setInfo();
    if (!await verifySet(mseSet))
        throw new Error('User cancelled import.');
    progress.setMax(mseSet.card.length);
    progress.setStatus(L`Loading set info`);
    await importSetInfo(mseSet.set_info, project, adapter);
    progress.setStatus(L`Importing cards`);
    const reportFailure = makeFailureReporter(filePath, failures);
    const cardMap = await importCards(mseSet, adapter, reportFailure);
    addCardsToProject(cardMap, project, reportFailure);
    if (mseSet.card.length && !project.cards.length)
        throw new Error(L`No cards could be imported. See the error report for details.`);
    return [project, failures];
}

function showPartialStatus(project, failures) {
    progress.setTitle(L`Import partially complete`);
    const numCards = project.cards.length;
    const numFails = failures.length;
    progress.setStatus(L`Imported ${numCards} cards; ${numFails} cards failed.`);
    progress.setOperation(L`Skipped entries are listed in the error report.`);
}

registerAction('import-mse-set', async () => {
    log('user').info('Import MSE set');
    const filePath = await platform.openSingleFileDialog(L`Import an MSE Set`);
    if (!filePath) return;
    log('state').info('Importing MSE set:', filePath);
    openModal('cm-progress-modal', { title: L`Importing...` });
    try {
        await withNewContext(async () => {
            const [project, failures] = await importMseFile(filePath);
            progress.setTitle(L`Import complete!`);
            progress.complete();
            setActiveProject(project);
            if (failures.length) showPartialStatus(project, failures);
        });
    } catch (error) {
        progress.onError(error);
        report('import', error, [filePath]);
        log('user').error('Error importing MSE set', error);
    }
});
