import YAMLSerializer from './serializers/YAMLSerializer.js';
import {
    getJoinedPath,
    getParentPath,
    mount
} from '../../shared/neutralinoAdapter.js';

async function loadCards(set, projectPath) {
    const cardsFolderPath = await getJoinedPath(projectPath, 'cards');
    set.cards = await Promise.all(
        set.cards.map(async baseName => {
            const basePath = await getJoinedPath(cardsFolderPath, baseName);
            return YAMLSerializer.load(`${basePath}.yml`);
        })
    );
}

export async function loadProject(filePath) {
    const projectPath = await getParentPath(filePath);
    await mount('/project', projectPath, { replace: true });
    const set = await YAMLSerializer.load(filePath);
    await loadCards(set, projectPath);
    return set;
}
