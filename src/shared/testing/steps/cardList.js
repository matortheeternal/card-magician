import { executeAction } from '../../../ui/systems/actionSystem.js';
import {
    createCard, flushCard, setCardFields, waitForCardUpdates
} from '../testUtils.js';

function listView() {
    return document.querySelector('cm-card-list cm-list-view');
}

export async function addNamedCard(name, fields = {}) {
    const card = await createCard();
    await setCardFields({ name, ...fields });
    await flushCard();
    return card;
}

export async function selectCard(card) {
    await executeAction('reveal-card', card);
    await waitForCardUpdates();
}

export function selectCards(cards) {
    const list = listView();
    list.selection = list.activeRows.flatMap((row, index) => {
        return cards.includes(row.original) ? [index] : [];
    });
}

export function selectedCards() {
    return listView().selection.map(row => row.original);
}

export function visibleCards() {
    return listView().rows;
}

export function sortCardsBy(columnId) {
    const list = listView();
    const column = list.activeColumns.find(col => col.id === columnId);
    column.sort = { priority: 1, direction: 'asc' };
    list.sortRows();
    return () => { delete column.sort; };
}

export async function dropImages(files) {
    await document.querySelector('cm-card-list').onDrop({
        preventDefault() {},
        stopPropagation() {},
        dataTransfer: { items: files.map(file => ({
            kind: 'file', type: file.type, getAsFile: () => file
        })) }
    });
    await waitForCardUpdates();
}
