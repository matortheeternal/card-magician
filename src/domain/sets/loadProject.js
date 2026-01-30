import YAMLSerializer from './serializers/YAMLSerializer.js';
import { getJoinedPath, readBinaryFile } from '../../shared/neutralinoAdapter.js';
import { getActiveGame } from '../game/gameManager.js';
import {checkFileExists} from '../../shared/fsUtils.js';

async function loadImages(card, basePath) {
    const game = getActiveGame();
    await game.loadCardImages(card, async (key, count, setCallback) => {
        const imageFilePath = count > 1
            ? `${basePath} - ${key.toTitleCase()}.jpg`
            : `${basePath}.jpg`;
        const imageExists = await checkFileExists(imageFilePath);
        if (!imageExists) return;
        const data = await readBinaryFile(imageFilePath);
        const blob = new Blob([data], { type: 'image/jpg' });
        setCallback(card, blob);
    });
}

async function loadCards(set, filePath) {
    const cardsFolderPath = await getJoinedPath(filePath, '..', 'cards');
    set.cards = await Promise.all(
        set.cards.map(async baseName => {
            const basePath = await getJoinedPath(cardsFolderPath, baseName);
            const card = await YAMLSerializer.load(`${basePath}.yml`);
            await loadImages(card, basePath);
            return card;
        })
    );
}

export async function loadProject(filePath) {
    const set = await YAMLSerializer.load(filePath);
    await loadCards(set, filePath);
    return set;
}
