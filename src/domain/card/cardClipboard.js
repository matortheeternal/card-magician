import ImageFieldValue from './ImageFieldValue.js';
import YAMLSerializer from '../projects/serializers/YAMLSerializer.js';
import {
    createDirectory,
    getJoinedPath,
    getPathParts,
    rmrf,
    writeBinaryFile
} from '../../shared/neutralinoAdapter.js';
import { find, loadImageFile } from '../../shared/fsUtils.js';
import { createURL } from '../../ui/systems/objectUrlSystem.js';

export const CARD_CLIPBOARD_TYPE = 'web application/x-card-magician-cards';

const SNAPSHOT_VERSION = 1;
let previousSnapshotPath;

async function createSnapshot(cards) {
    const rootPath = await getJoinedPath(NL_DATAPATH, 'card-clipboard');
    const snapshotPath = await getJoinedPath(rootPath, crypto.randomUUID());
    await createDirectory(rootPath);
    await createDirectory(snapshotPath);

    try {
        const cardFiles = [];
        for (const card of cards) {
            const filename = `${card.baseName}.yml`;
            const filePath = await getJoinedPath(snapshotPath, filename);
            await YAMLSerializer.save(filePath, card);
            cardFiles.push(filename);

            for (const [key, image] of card.files.fields) {
                if (!(image instanceof ImageFieldValue) || !image.imageUrl) continue;
                const definition = card.files.resolveDefinition(key);
                const imagePath = await getJoinedPath(
                    snapshotPath,
                    definition.getFilename(card)
                );
                await writeBinaryFile(imagePath, await image.loadImageData());
            }
        }

        return {
            snapshotPath,
            payload: {
                version: SNAPSHOT_VERSION,
                game: activeProject.game,
                snapshotPath,
                cardFiles,
            }
        };
    } catch (error) {
        await cleanupSnapshot(snapshotPath);
        throw error;
    }
}

async function cleanupSnapshot(snapshotPath) {
    if (!snapshotPath) return;
    try {
        await rmrf(snapshotPath);
    } catch (error) {
        log('fs').warn('Failed to remove card clipboard snapshot', error);
    }
}

export async function writeCardsToClipboard(cards, imageBlob, ready) {
    const snapshotPromise = Promise.resolve(ready).then(() => {
        return createSnapshot(cards);
    });

    try {
        const cardData = snapshotPromise.then(({ payload }) => new Blob(
            [JSON.stringify(payload)],
            { type: CARD_CLIPBOARD_TYPE }
        ));
        const item = new ClipboardItem({
            [CARD_CLIPBOARD_TYPE]: cardData,
            'image/png': imageBlob,
        });
        await navigator.clipboard.write([item]);
        const { snapshotPath } = await snapshotPromise;
        await cleanupSnapshot(previousSnapshotPath);
        previousSnapshotPath = snapshotPath;
    } catch (error) {
        const snapshot = await snapshotPromise.catch(() => null);
        await cleanupSnapshot(snapshot?.snapshotPath);
        throw error;
    }
}

async function getClipboardPayload() {
    const items = await navigator.clipboard.read();
    const item = items.find(item => item.types.includes(CARD_CLIPBOARD_TYPE));
    if (!item) return null;
    const blob = await item.getType(CARD_CLIPBOARD_TYPE);
    return JSON.parse(await blob.text());
}

async function validatePayload(payload) {
    if (payload?.version !== SNAPSHOT_VERSION) return false;
    if (payload.game !== activeProject.game) return false;
    if (!payload.snapshotPath || !Array.isArray(payload.cardFiles)) return false;
    const rootPath = await getJoinedPath(NL_DATAPATH, 'card-clipboard');
    const { filename, parentPath } = await getPathParts(payload.snapshotPath);
    if (parentPath !== rootPath) return false;
    if (!/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(filename))
        return false;
    return payload.cardFiles.length > 0 && payload.cardFiles.every(filename => {
        return typeof filename === 'string'
            && !filename.includes('/')
            && !filename.includes('\\')
            && /\.yml$/i.test(filename);
    });
}

export async function readCardsFromClipboard() {
    const payload = await getClipboardPayload();
    if (!await validatePayload(payload)) return [];

    const files = await find(payload.snapshotPath);
    const filesByName = new Map();
    for (const filePath of files) {
        const filename = filePath.replaceAll('\\', '/').split('/').pop();
        filesByName.set(filename.toLowerCase(), filePath);
    }

    const cards = [];
    for (const filename of payload.cardFiles) {
        const filePath = filesByName.get(filename.toLowerCase());
        if (!filePath) continue;
        const card = await activeProject.loadCard(filePath);
        await card.loadFiles(filesByName);

        for (const [key, image] of card.files.fields) {
            const imagePath = card.files.get(key);
            if (!(image instanceof ImageFieldValue) || !imagePath) continue;
            image.imageUrl = createURL(await loadImageFile(imagePath));
            image.dirty = true;
        }
        card.files.detach();
        cards.push(card);
    }
    return cards;
}
