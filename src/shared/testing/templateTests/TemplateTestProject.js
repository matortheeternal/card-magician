import platform from '../../platformAdapter.js';
import { getExtensionDirectory } from '../../extensionManager.js';

const TEST_FOLDER = '.tests';
const PROJECT_EXTENSION = '.cmproj';
const CARD_EXTENSION = '.yml';

async function readEntries(folderPath) {
    if (!await platform.checkFolderExists(folderPath)) return [];
    const entries = await platform.readDirectory(folderPath);
    return entries.filter(entry => entry.entry !== '.' && entry.entry !== '..');
}

async function findTestFolders(folderPath) {
    const folders = [];
    for (const entry of await readEntries(folderPath)) {
        if (entry.type !== 'DIRECTORY') continue;
        const childPath = `${folderPath}/${entry.entry}`;
        if (entry.entry === TEST_FOLDER) {
            folders.push(childPath);
            continue;
        }
        folders.push(...await findTestFolders(childPath));
    }
    return folders;
}

function fileNames(entries, extension) {
    return entries
        .map(entry => entry.entry)
        .filter(name => name.endsWith(extension))
        .sort();
}

function matchesTemplate(templateId, filter) {
    return !filter || templateId === filter || templateId.startsWith(`${filter}/`);
}

export default class TemplateTestProject {
    constructor(templateId, folderPath, projectFile, cardNames) {
        this.templateId = templateId;
        this.folderPath = folderPath;
        this.projectFile = projectFile;
        this.cardNames = cardNames;
    }

    static async load(templatesPath, folderPath) {
        const templateFolder = folderPath.slice(0, -TEST_FOLDER.length - 1);
        const templateId = templateFolder.slice(templatesPath.length + 1);
        const entries = await readEntries(folderPath);
        const [projectFile] = fileNames(entries, PROJECT_EXTENSION);
        const cardEntries = await readEntries(`${folderPath}/cards`);
        const cardFiles = fileNames(cardEntries, CARD_EXTENSION);
        const cardNames = cardFiles.map(name => name.slice(0, -CARD_EXTENSION.length));
        return new TemplateTestProject(templateId, folderPath, projectFile, cardNames);
    }

    static async findAll(templateFilter) {
        const templatesPath = getExtensionDirectory().child('templates').filePath;
        const folders = await findTestFolders(templatesPath);
        const projects = await Promise.all(folders.map(folder => {
            return TemplateTestProject.load(templatesPath, folder);
        }));
        return projects
            .filter(project => project.projectFile)
            .filter(project => matchesTemplate(project.templateId, templateFilter))
            .sort((a, b) => a.templateId.localeCompare(b.templateId));
    }

    get projectPath() {
        return `${this.folderPath}/${this.projectFile}`;
    }

    imagePath(folder, name, extension) {
        return `${this.folderPath}/${folder}/${name}.${extension}`;
    }

    get outputPath() {
        return `${this.folderPath}/output`;
    }

    async clearOutput() {
        if (await platform.checkFolderExists(this.outputPath))
            await platform.rmrf(this.outputPath);
    }

    expectedImagePath(name) {
        return this.imagePath('expected', name, 'webp');
    }
}
