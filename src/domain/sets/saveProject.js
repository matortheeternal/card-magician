import {
    createDirectory, getJoinedPath, getMounts, getParentPath, mount, unmount,
    writeBinaryFile, writeFile
} from '../../shared/neutralinoAdapter.js';
import YAMLSerializer from './serializers/YAMLSerializer.js';
import { getActiveGame } from '../game/gameManager.js';
import { updateBaseNames } from './cardNamer.js';

async function saveCardData(cardsFolderPath, baseName, card, serializer) {
    const text = await serializer.serialize(card);
    const basePath = await getJoinedPath(cardsFolderPath, baseName);
    await writeFile(`${basePath}.yml`, text);
}

async function saveCardImages(cardsFolderPath, baseName, card) {
    const game = getActiveGame();
    const images = await game.getCardImages(card);
    for (const { data, key, value } of images) {
        const imageFileName = images.length > 1
            ? `${baseName} - ${key.toTitleCase()}.jpg`
            : `${baseName}.jpg`;
        const imagePath = await getJoinedPath(cardsFolderPath, imageFileName);
        await writeBinaryFile(imagePath, data);
        value.imageUrl = await getJoinedPath('/project/cards', imageFileName);
        delete value.dirty;
    }
}

async function saveCards(filePath, zippedCards, serializer) {
    const cardsFolderPath = await getJoinedPath(filePath, '..', 'cards');
    await createDirectory(cardsFolderPath);
    for (const [baseName, card] of zippedCards) {
        if (!card.dirty) continue;
        await saveCardImages(cardsFolderPath, baseName, card);
        await saveCardData(cardsFolderPath, baseName, card, serializer);
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
    await unmount('/project');
    const folderPath = await getParentPath(filePath);
    await mount('/project', folderPath, { replace: true });
}
