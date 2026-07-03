import { getActiveGame } from '../game/gameManager.js';
import {
    getFileName,
    getJoinedPath,
    readDirectory,
    rmrf
} from '../../shared/neutralinoAdapter.js';
import * as progress from '../../ui/systems/progressSystem.js';
import YAMLSerializer from './serializers/YAMLSerializer.js';

async function getImageFileNames(card) {
    const filenames = [];
    const game = getActiveGame();
    const images = await game.getCardImages(card, true);
    for (const { value } of images) {
        const urlPath = decodeURIComponent(value.imageUrl);
        const imageFileName = await getFileName(urlPath);
        filenames.push(imageFileName);
    }
    return filenames;
}

async function getCardFileNames(filePath) {
    const set = await YAMLSerializer.load(filePath);
    return set.cards.map(name => `${name}.yml`);
}

async function getUsedFileNames(filePath, data) {
    const filenames = await getCardFileNames(filePath);
    for (const card of data.cards)
        filenames.push(...await getImageFileNames(card));
    return filenames;
}

export default async function cleanProject(filePath, data) {
    progress.setStatus('Getting used filenames');
    const usedFileNames = await getUsedFileNames(filePath, data);
    console.log(usedFileNames);
    const cardsFolderPath = await getJoinedPath(filePath, '..', 'cards');
    progress.setStatus('Checking for unused files');
    const existingFiles = await readDirectory(cardsFolderPath);
    progress.setMax(existingFiles.length + 1);
    console.log(existingFiles);
    for (const { entry, path, type } of existingFiles) {
        progress.increment();
        if (type === 'FILE' && usedFileNames.includes(entry)) continue;
        progress.setOperation(`Deleting ${path}`);
        await rmrf(path);
    }
}
