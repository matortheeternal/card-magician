import {
    getJoinedPath, getMounts, getParentPath, moveFile,
    mount, unmount, writeBinaryFile, writeFile
} from '../../shared/neutralinoAdapter.js';
import YAMLSerializer from './serializers/YAMLSerializer.js';
import { getActiveGame } from '../game/gameManager.js';
import { updateBaseNames, updateBaseName } from './cardNamer.js';
import * as progress from '../../ui/systems/progressSystem.js';
import { getTags } from '../game/tagManager.js';

async function saveCardData(cardsFolderPath, card, serializer) {
    const text = await serializer.serialize(card);
    const basePath = await getJoinedPath(cardsFolderPath, card.baseName);
    card.files ||= {};
    card.files.data = `${basePath}.yml`;
    await writeFile(`${basePath}.yml`, text);
}

async function saveCardImages(cardsFolderPath, card, fullSave) {
    const game = getActiveGame();
    const images = await game.getCardImages(card, fullSave);
    for (const { data, key, value } of images) {
        const imageFileName = images.length > 1
            ? `${card.baseName} - ${key.toTitleCase()}.jpg`
            : `${card.baseName}.jpg`;
        const imagePath = await getJoinedPath(cardsFolderPath, imageFileName);
        await writeBinaryFile(imagePath, data);
        const filenameUrlPart = encodeURIComponent(imageFileName);
        value.imageUrl = await getJoinedPath('/project/cards', filenameUrlPart);
        delete value.dirty;
    }
}

function* getFileEntries(files) {
    for (const [key, value] of Object.entries(files)) {
        if (value && typeof value === 'object') {
            yield* getFileEntries(value);
            continue;
        }

        yield {
            change: v => { files[key] = v; },
            filePath: value
        };
    }
}

async function renameCardFiles(card, cardsFolderPath) {
    if (!card.files?.data) return;
    const baseNameLength = card.files.data.length - 4;
    for (const entry of getFileEntries(card.files)) {
        const newFileName = `${card.baseName}${entry.filePath.slice(baseNameLength)}`;
        const newFilePath = await getJoinedPath(cardsFolderPath, newFileName);
        if (newFilePath === entry.filePath) continue;
        await moveFile(entry.filePath, newFilePath);
        entry.change(newFilePath);
    }
}

export async function saveCard(card, setFolderPath) {
    if (!setFolderPath) return;
    const serializer = new YAMLSerializer();
    const cardsFolderPath = await getJoinedPath(setFolderPath, 'cards');
    updateBaseName(card);
    await renameCardFiles(card, cardsFolderPath);
    await saveCardData(cardsFolderPath, card, serializer);
    await saveCardImages(cardsFolderPath, card, false);
}

async function saveCards(filePath, zippedCards, serializer, fullSave) {
    if (!fullSave) return;
    const cardsFolderPath = await getJoinedPath(filePath, '..', 'cards');
    for (const [baseName, card] of zippedCards) {
        progress.setOperation(`Saving card ${baseName}`);
        await saveCardImages(cardsFolderPath, baseName, card, fullSave);
        await saveCardData(cardsFolderPath, card, serializer);
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
    await mount('/project', folderPath);
}

export async function saveProjectTags(filePath) {
    const projectTags = getTags();
    if (!projectTags.length) return;
    const tagsPath = await getJoinedPath(filePath, '..', 'tags.yml');
    await YAMLSerializer.save(tagsPath, projectTags);
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
