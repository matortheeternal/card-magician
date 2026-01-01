import JSONSerializer from './JSONSerializer.js';
import YAMLSerializer from './YAMLSerializer.js';
import MessagePackSerializer from './MessagePackSerializer.js';
import { addStatusMessage } from '../../ui/systems/statusSystem.js';
import { registerAction } from '../../ui/systems/actionSystem.js';
import { getActiveGame, getConfig } from '../game/gameManager.js';
import {
    openSingleFileDialog,
    saveSingleFileDialog
} from '../../shared/neutralinoAdapter.js';
import { buildCard } from '../card/cardBuilder.js';

const L = localize('set-manager');
const serializers = [MessagePackSerializer, YAMLSerializer, JSONSerializer];

const cardChangedCallbacks = [];
const setChangedCallbacks = [];
let activeSet = { cards: [] };
let setFilePath = null;
let activeCard = null;
let selectedCard = null;

export async function saveSetData(filePath, data) {
    const serializer = serializers.find(s => s.matches(filePath));
    await serializer.save(filePath, data);
}

export async function loadSetData(filePath) {
    const serializer = serializers.find(s => s.matches(filePath));
    return await serializer.load(filePath);
}

export async function saveAs() {
    const defaultPath = setFilePath
        ?  setFilePath.split(/[\\\/]/).pop()
        : `${activeSet.title || L`My Set`}.json`;
    const filePath = saveSingleFileDialog(L`Save set to file`, defaultPath, [
        { name: L`JSON Files`, extensions: ['json'] },
        { name: L`Packed Files`, extensions: ['msgpack'] },
        { name: L`YAML Files`, extensions: ['yml'] },
        { name: L`All files`, extensions: ['*'] }
    ]);
    if (!filePath) return;
    console.info('Saving set to:', filePath);
    setFilePath = filePath;
    await saveSetData(filePath, activeSet);
}

export async function save() {
    if (!setFilePath) return await saveAs();
    const message = addStatusMessage(L`Saving...`, -1);
    console.info('Saving set to:', setFilePath);
    await saveSetData(setFilePath, activeSet);
    message.text = L`Saved.`;
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
    setFilePath = null;
    setActiveSet();
}

export async function openSet(filePath) {
    filePath = filePath || await openSingleFileDialog(L`Open a set`, [
        { name: L`JSON Files`, extensions: ['json'] },
        { name: L`All files`, extensions: ['*'] }
    ]);
    if (!filePath) return;
    console.info('%cOpening set:', 'color:gold', filePath);
    const game = getActiveGame();
    const setData = await loadSetData(filePath);
    setFilePath = filePath;
    setActiveSet(game.loadSet(setData));
    await getConfig().addRecentFile(filePath);
}

export function getActiveSet() {
    return activeSet;
}

export function getSetCards() {
    return activeSet.cards.slice();
}

export function getSelectedCard() {
    return selectedCard;
}

export async function saveActiveCard() {
    selectedCard.front = await activeCard.front.save();
    if (activeCard.back)
        selectedCard.back = await activeCard.back.save();
}

export function onActiveCardChanged(callback) {
    cardChangedCallbacks.push(callback);
}

export function onActiveSetChanged(callback) {
    setChangedCallbacks.push(callback);
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
    selectedCard[faceId] = {};
    setActiveCard(selectedCard);
});
registerAction('change-template', (faceId, newTemplateId) => {
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
