import { checkFileExists, loadJson, loadTextFile } from './fsHelpers.js';

const templates = [];

async function loadTemplateFile(templateFolder, load, ext) {
    const filename = `template.${ext}`;
    const filePath = ['.', templateFolder.path, filename].join('/');
    if (!await checkFileExists(filePath)) return;
    return await load(filePath);
}

export async function loadTemplates() {
    const templateFolders = await Neutralino.filesystem.readDirectory(
        'templates',
        { recursive: true }
    );
    for (const folder of templateFolders) {
        const template = await loadTemplateFile(folder, loadJson, 'json');
        if (!template) continue;
        template.folder = folder;
        template.css = await loadTemplateFile(folder, loadTextFile, 'css');
        template.html = await loadTemplateFile(folder, loadTextFile, 'html');
        if (!template.css || !template.html) {
            console.warn(`Incomplete template found at`, folder);
            continue;
        }
        templates.push(template);
    }
}

export function getTemplate(templateId) {
    return templates.find(t => t.id === templateId);
}

export function getTemplates() {
    return templates.slice();
}
