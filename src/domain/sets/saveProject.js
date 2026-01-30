import {
    createDirectory, getJoinedPath, rmrf,
    writeBinaryFile, writeFile
} from '../../shared/neutralinoAdapter.js';
import YAMLSerializer from './serializers/YAMLSerializer.js';
import { getActiveGame } from '../game/gameManager.js';
import { updateBaseNames } from './cardNamer.js';

async function prepareCardsDirectory(filePath) {
    const cardsFolderPath = await getJoinedPath(filePath, '..', 'cards');
    try {
        await rmrf(cardsFolderPath);
    } catch {}
    await createDirectory(cardsFolderPath);
    return cardsFolderPath;
}

async function saveCardData(basePath, card, serializer) {
    const text = await serializer.serialize(card);
    await writeFile(`${basePath}.yml`, text);
}

async function saveCardImages(basePath, card) {
    const game = getActiveGame();
    const images = await game.getCardImages(card);
    for (const image of images) {
        const imagePath = images.length > 1
            ? `${basePath} - ${image.key.toTitleCase()}.jpg`
            : `${basePath}.jpg`;
        await writeBinaryFile(imagePath, image.data);
    }
}

async function saveCards(filePath, zippedCards, serializer) {
    const cardsFolderPath = await prepareCardsDirectory(filePath);
    for (const [baseName, card] of zippedCards) {
        const basePath = await getJoinedPath(cardsFolderPath, baseName);
        await saveCardData(basePath, card, serializer);
        await saveCardImages(basePath, card);
    }
}

async function saveSet(filePath, setData, serializer) {
    const text = await serializer.serialize(setData);
    await writeFile(filePath, text);
}

export async function saveProject(filePath, data) {
    const serializer = new YAMLSerializer();
    const cardBaseNames = updateBaseNames(data.cards);
    await saveCards(filePath, cardBaseNames.zip(data.cards), serializer);
    await saveSet(filePath, {
        ...data,
        cards: cardBaseNames
    }, serializer);
}
