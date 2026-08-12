import YAMLSerializer from './serializers/YAMLSerializer.js';
import {
    getJoinedPath,
    mount
    getParentPath, getPathParts,
} from '../../shared/neutralinoAdapter.js';
import { loadTags } from '../game/tagManager.js';
import { checkFileExists, find } from '../../shared/fsUtils.js';

async function loadCard(filePath) {
    const card = await YAMLSerializer.load(filePath);
    const { stem } = await getPathParts(filePath);
    card.baseName = stem;
    card.files = {};
    card.files.data = filePath;
    return card;
}

async function loadCards(set, projectPath) {
    set.cards = [];
    const cardsFolderPath = await getJoinedPath(projectPath, 'cards');
    const files = await find(cardsFolderPath, { matching: /.yml$/i });
    for (const filePath of files) {
        try {
            const card = await loadCard(filePath);
            set.cards.push(card);
        } catch {
            log('state').error(`Failed to load card file ${filePath}`);
        }
    }
}

async function loadProjectTags(filePath) {
    const tagsPath = await getJoinedPath(filePath, '..', 'tags.yml');
    const fileExists = await checkFileExists(tagsPath);
    const projectTags = fileExists
        ? await YAMLSerializer.load(tagsPath)
        : [];
    loadTags(projectTags);
}

export async function loadProject(filePath) {
    const projectPath = await getParentPath(filePath);
    await mount('/project', projectPath, { replace: true });
    const set = await YAMLSerializer.load(filePath);
    await loadCards(set, projectPath);
    await loadProjectTags(filePath);
    return set;
}
