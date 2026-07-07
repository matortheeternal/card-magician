import {
    createDirectory, getJoinedPath, getMounts, getParentPath, mount, unmount,
    writeBinaryFile, writeFile
} from '../../shared/neutralinoAdapter.js';
import YAMLSerializer from './serializers/YAMLSerializer.js';
import { getActiveGame } from '../game/gameManager.js';
import { updateBaseNames } from './cardNamer.js';
import * as progress from '../../ui/systems/progressSystem.js';
import { getTags } from '../game/tagManager.js';

async function saveCardData(cardsFolderPath, baseName, card, serializer) {
    const text = await serializer.serialize(card);
    const basePath = await getJoinedPath(cardsFolderPath, baseName);
    await writeFile(`${basePath}.yml`, text);
}

async function saveCardImages(cardsFolderPath, baseName, card, fullSave) {
    const game = getActiveGame();
    const images = await game.getCardImages(card, fullSave);
    for (const { data, key, value } of images) {
        const imageFileName = images.length > 1
            ? `${baseName} - ${key.toTitleCase()}.jpg`
            : `${baseName}.jpg`;
        const imagePath = await getJoinedPath(cardsFolderPath, imageFileName);
        await writeBinaryFile(imagePath, data);
        const filenameUrlPart = encodeURIComponent(imageFileName);
        value.imageUrl = await getJoinedPath('/project/cards', filenameUrlPart);
        delete value.dirty;
    }
}

async function saveCards(filePath, zippedCards, serializer, fullSave) {
    const cardsFolderPath = await getJoinedPath(filePath, '..', 'cards');
    await createDirectory(cardsFolderPath);
    for (const [baseName, card] of zippedCards) {
        if (!card.dirty && !fullSave) continue;
        progress.setOperation(`Saving card ${baseName}`);
        await saveCardImages(cardsFolderPath, baseName, card, fullSave);
        await saveCardData(cardsFolderPath, baseName, card, serializer);
        progress.increment();
    }
}

async function saveSet(filePath, setData, serializer) {
    const text = await serializer.serialize(setData);
    await writeFile(filePath, text);
}

async function updateProjectMount(filePath) {
    const folderPath = await getParentPath(filePath);
    const mounts = await getMounts();
    if (mounts['/project'] === folderPath) return;
    await unmount('/project');
    await mount('/project', folderPath, { replace: true });
}

export async function saveProjectTags(filePath) {
    const tagsPath = await getJoinedPath(filePath, '..', 'tags.yml');
    await YAMLSerializer.save(tagsPath, getTags());
}

export async function saveProject(filePath, data, fullSave) {
    const serializer = new YAMLSerializer();
    progress.setStatus('Preparing cards');
    const changedCards = data.cards.filter(card => card.dirty || fullSave);
    const cardBaseNames = updateBaseNames(data.cards);
    progress.setStatus('Saving cards');
    progress.setMax(changedCards.length + 2);
    await saveCards(filePath, cardBaseNames.zip(data.cards), serializer, fullSave);
    progress.setStatus('Saving tags');
    await saveProjectTags(filePath);
    progress.setStatus('Saving project file');
    await saveSet(filePath, {
        ...data,
        cards: cardBaseNames
    }, serializer);
    progress.increment();
    progress.setStatus('Remounting project');
    await updateProjectMount(filePath);
}
