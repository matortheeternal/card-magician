import { registerAction } from '../../ui/systems/actionSystem.js';
import { getActiveGame, getConfig } from '../game/gameManager.js';
import {
    getParentPath,
    openFolderDialog,
    openSingleFileDialog,
    saveSingleFileDialog
} from '../../shared/neutralinoAdapter.js';
import { buildCard } from '../card/cardBuilder.js';
import { saveProject } from './saveProject.js';
import { loadProject } from './loadProject.js';
import { openModal } from '../../ui/modals/modalManager.js';
import * as progress from '../../ui/systems/progressSystem.js';
import { withNewContext } from '../../ui/systems/objectUrlSystem.js';

const L = localize('set-manager');

const filters = [
    { name: L`Project Files`, extensions: ['cmproj'] },
    { name: L`All files`, extensions: ['*'] }
];
const cardChangedCallbacks = [];
const setChangedCallbacks = [];
let activeSet = { cards: [] };
let setFolderPath = null;
let setFilePath = null;
let activeCard = null;
let selectedCard = null;

export async function selectSetFolderPath() {
    if (setFolderPath) return true;
    setFolderPath = await openFolderDialog(L`Choose folder to save set files to`);
    return Boolean(setFolderPath);
}

export async function saveAs() {
    log('user').info('save as');
    const filePath = await saveSingleFileDialog(
        L`Save set to file`,
        setFilePath || `${activeSet.title || L`My Set`}.cmproj`,
        filters
    );
    if (!filePath) return;
    setFolderPath = await getParentPath(filePath);
    setFilePath = filePath;
    return save();
}

export async function save() {
    if (!setFilePath) return saveAs();
    openModal('cm-progress-modal', { title: 'Saving...', autoclose: true });
    try {
        log('fs').info('Saving set to:', setFilePath);
        await saveProject(setFilePath, activeSet);
        progress.complete();
    } catch (error) {
        progress.onError(error);
        log('state').error(error);
    }
}

export function setActiveSet(set) {
    const game = getActiveGame();
    activeSet = set;
    game.autoNumberCards(activeSet);
    for (const callback of setChangedCallbacks)
        callback(activeSet);
}

export async function newSet() {
    log('user').info('new set');
    setFilePath = null;
    const game = getActiveGame();
    await withNewContext(() => {
        const newSet = game.newSet();
        setActiveSet(newSet);
    });
}

export async function openSet(filePath) {
    log('user').info('Open set');
    filePath = filePath || await openSingleFileDialog(L`Open a set`, filters);
    if (!filePath) return;
    log('state').info('Opening set:', filePath);
    const game = getActiveGame();
    await withNewContext(async () => {
        const setData = await loadProject(filePath);
        setFilePath = filePath;
        setActiveSet(game.loadSet(setData));
    });
    await getConfig().addRecentFile(filePath);
}

export function getActiveSet() {
    return activeSet;
}

export function getActiveSkeleton() {
    return activeSet.skeleton;
}

export function getSetFolderPath() {
    return setFolderPath;
}

export function getSelectedCard() {
    return selectedCard;
}

export async function saveActiveCard() {
    log('state').debug('save active card');
    selectedCard.dirty = true;
    selectedCard.front = await activeCard.front.save();
    if (activeCard.back)
        selectedCard.back = await activeCard.back.save();
    changed(activeSet, 'cards');
}

export function onActiveCardChanged(callback) {
    cardChangedCallbacks.push(callback);
}

export function onActiveSetChanged(callback) {
    setChangedCallbacks.push(callback);
    callback(activeSet);
}

export async function setActiveCard(card) {
    if (activeCard?.front) activeCard.front.dispose();
    if (activeCard?.back) activeCard.back.dispose();
    activeCard = card ? await buildCard(card) : null;
    cardChangedCallbacks.forEach(cb => cb(activeCard));
}

export async function selectCard(card) {
    selectedCard = card;
    await setActiveCard(card);
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
registerAction('open-set', openSet);
registerAction('new-set', () => {
    newSet();
    setActiveCard(null);
});
registerAction('save-set', save);
registerAction('save-set-as', saveAs);
