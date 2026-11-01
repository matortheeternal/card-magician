import ImageFieldValue from '../../domain/card/ImageFieldValue.js';
import {
    readCardsFromClipboard,
    writeCardsToClipboard
} from '../../domain/card/cardClipboard.js';
import { updateBaseName } from '../../domain/projects/cardNamer.js';
import { cardsToBlob } from '../../domain/export/cardImageExporter.js';
import JSONSerializer from '../../domain/projects/serializers/JSONSerializer.js';
import { executeAction, registerAction } from './actionSystem.js';
import { flushPendingCardEdits } from './cardEditingSystem.js';

const L = localize('clipboard-system');
const report = createReporter({
    unit: 'ClipboardSystem',
    label: L`Clipboard System`
});

export async function copyCard(listView) {
    try {
        const cards = listView.selection.map(row => row.original);
        if (!cards.length) return;
        const ready = flushPendingCardEdits().then(() => {
            for (const card of cards)
                updateBaseName(card);
        });

        const imageBlob = ready.then(() => cardsToBlob(cards));
        await writeCardsToClipboard(cards, imageBlob, ready);
    } catch (error) {
        report('copyCard', error, [listView.selection]);
        log('user').error('Copy failed', error);
    }
}

export async function pasteCard(listView) {
    try {
        log('user').info('paste card');
        const cards = await readCardsFromClipboard();
        if (!cards.length) return;

        await executeAction('create-cards', cards);
    } catch (error) {
        report('pasteCard', error, [listView.selection]);
        log('user').error('Paste failed', error);
    }
}

async function duplicateCard(sourceCard) {
    const serializer = new JSONSerializer();
    const data = await serializer.deserialize(
        await serializer.serialize(sourceCard)
    );
    const card = new activeGame.Card(data);
    const sourceImages = new Map(sourceCard.files.fields);
    for (const [key, image] of card.files.fields) {
        const sourceImage = sourceImages.get(key);
        if (!(image instanceof ImageFieldValue)
            || !(sourceImage instanceof ImageFieldValue)) continue;
        Object.assign(image, sourceImage.clone());
        image.dirty = Boolean(image.imageUrl);
    }

    return card;
}

export async function duplicateCards(listView) {
    try {
        await flushPendingCardEdits();
        const sourceCards = listView.selection.map(row => row.original);
        const cards = [];

        for (const sourceCard of sourceCards) {
            const card = await duplicateCard(sourceCard);
            cards.push(card);
        }

        if (cards.length) await executeAction('create-cards', cards);
    } catch (error) {
        report('duplicateCard', error, [listView.selection]);
        log('user').error('Duplicate failed', error);
    }
}

function getCardsListView() {
    return document.querySelector('cm-set-view cm-list-view');
}

registerAction('copy', () => {
    const listView = getCardsListView();
    return copyCard(listView);
});

registerAction('paste', () => {
    const listView = getCardsListView();
    return pasteCard(listView);
});

registerAction('duplicate-selected-cards', () => {
    const listView = getCardsListView();
    return duplicateCards(listView);
});
