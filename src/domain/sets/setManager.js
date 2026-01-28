import { addStatusMessage } from '../../ui/systems/statusSystem.js';
import { registerAction } from '../../ui/systems/actionSystem.js';
import { getActiveGame, getConfig } from '../game/gameManager.js';
import {
    openSingleFileDialog,
    saveSingleFileDialog
} from '../../shared/neutralinoAdapter.js';
import { buildCard } from '../card/cardBuilder.js';
import { saveProject } from './saveProject.js';
import { loadProject } from './loadProject.js';

const L = localize('set-manager');

const filters = [
    { name: L`Project Files`, extensions: ['cmproj'] },
    { name: L`All files`, extensions: ['*'] }
];
const cardChangedCallbacks = [];
const setChangedCallbacks = [];
let activeSet = { cards: [] };
let setFilePath = null;
let activeCard = null;
let selectedCard = null;

export async function saveAs() {
    log('user').info('save as');
    const defaultPath = setFilePath
        ?  setFilePath.split(/[\\\/]/).pop()
        : `${activeSet.title || L`My Set`}.json`;
    const filePath = await saveSingleFileDialog(
        L`Save set to file`,
        defaultPath,
        filters
    );
    if (!filePath) return;
    log('fs').info('Saving set to:', filePath);
    setFilePath = filePath;
    await saveProject(filePath, activeSet);
}

export async function save() {
    if (!setFilePath) return saveAs();
    const message = addStatusMessage(L`Saving...`, -1);
    log('fs').info('Saving set to:', setFilePath);
    await saveProject(setFilePath, activeSet);
    message.updateText(L`Saved.`);
    setTimeout(() => message.remove(), 1000);
}

function setActiveSet(set) {
    const game = getActiveGame();
    activeSet = set || game.newSet();
    game.autoNumberCards(activeSet);
    for (const callback of setChangedCallbacks)
        callback(activeSet);
}

export function newSet() {
    log('user').info('new set');
    setFilePath = null;
    setActiveSet();
}

export async function openSet(filePath) {
    log('user').info('Open set');
    filePath = filePath || await openSingleFileDialog(L`Open a set`, filters);
    if (!filePath) return;
    log('state').info('Opening set:', filePath);
    const game = getActiveGame();
    const setData = await loadProject(filePath);
    setFilePath = filePath;
    setActiveSet(game.loadSet(setData));
    await getConfig().addRecentFile(filePath);
}

export function getActiveSet() {
    return activeSet;
}

export function getSelectedCard() {
    return selectedCard;
}

export async function saveActiveCard() {
    log('state').debug('save active card');
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
