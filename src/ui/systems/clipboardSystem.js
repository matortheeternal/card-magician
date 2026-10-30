import { selectCard } from '../../domain/projects/projectManager.js';
import ImageFieldValue from '../../domain/card/ImageFieldValue.js';
import {
    readCardsFromClipboard,
    writeCardsToClipboard
} from '../../domain/card/cardClipboard.js';
import { updateBaseName } from '../../domain/projects/cardNamer.js';
import { cardsToBlob } from '../../domain/export/cardImageExporter.js';
import JSONSerializer from '../../domain/projects/serializers/JSONSerializer.js';

const L = localize('clipboard-system');
const report = createReporter({
    unit: 'ClipboardSystem',
    label: L`Clipboard System`
});

async function flushPendingEdits() {
    await document.querySelector('cm-card-form')?.save.flush();
    await document.querySelector('cm-card-properties')?.save.flush();
}

export async function copyCard(listView) {
    try {
        const cards = listView.selection.map(row => row.original);
        if (!cards.length) return;
        const ready = this.flushPendingEdits().then(() => {
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

        for (const card of cards) {
            updateBaseName(card);
            await card.save(true);
            activeProject.cards.push(card);
        }
        changed(activeProject, 'cards');
        const lastCard = activeProject.cards.slice(-1)[0];
        const index = listView.activeRows.findIndex(row => {
            return row.original === lastCard;
        });
        if (index === -1) return;
        listView.selection = [index];
        await selectCard(lastCard);
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

    updateBaseName(card);
    await card.save(true);
    activeProject.cards.push(card);
    return card;
}

export async function duplicateCards(listView) {
    try {
        await flushPendingEdits();
        const sourceCards = listView.selection.map(row => row.original);
        const cards = [];

        for (const sourceCard of sourceCards) {
            const card = await duplicateCard(sourceCard);
            cards.push(card);
        }

        if (!cards.length) return;
        changed(activeProject, 'cards');
        const lastCard = cards.at(-1);
        const index = listView.activeRows.findIndex(row => {
            return row.original === lastCard;
        });
        if (index === -1) return;
        listView.selection = [index];
        await selectCard(lastCard);
    } catch (error) {
        report('duplicateCard', error, [listView.selection]);
        log('user').error('Duplicate failed', error);
    }
}
