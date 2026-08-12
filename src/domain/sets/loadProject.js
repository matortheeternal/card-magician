import YAMLSerializer from './serializers/YAMLSerializer.js';
import {
    getJoinedPath,
    getParentPath, getPathParts,
    mount, unmount
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

function extractNameParts(filename) {
    const match = filename.match(/^(.+) - (Front|Back)$/);
    return {
        baseName: match ? match[1] : filename,
        faceKey: match ? match[2].toLowerCase() : 'front',
        fieldKey: 'artImage'
    };
}

async function loadCardImages(set, projectPath) {
    const cardsFolderPath = await getJoinedPath(projectPath, 'cards');
    const files = await find(cardsFolderPath, { matching: /.jpg$/i });
    for (const filePath of files) {
        const { stem, filename } = await getPathParts(filePath);
        const { baseName, faceKey, fieldKey } = extractNameParts(stem);
        const card = set.cards.find(card => card.baseName === baseName);
        if (!card?.[faceKey]?.[fieldKey]) continue;
        card.files[faceKey] ||= {};
        card.files[faceKey][fieldKey] = filePath;
        card[faceKey][fieldKey].imageUrl = [
            '/project',
            'cards',
            encodeURIComponent(filename)
        ].join('/');
    }
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
    await unmount('/project');
    await mount('/project', projectPath, { replace: true });
    const set = await YAMLSerializer.load(filePath);
    await loadCards(set, projectPath);
    await loadCardImages(set, projectPath);
    await loadProjectTags(filePath);
    return set;
}
