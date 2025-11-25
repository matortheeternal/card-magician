import { checkFileExists, loadJson, loadTextFile } from './fsHelpers.js';

const templates = [];

async function loadTemplateFile(templateFolder, load, filename) {
    const filePath = ['.', templateFolder.path, filename].join('/');
    if (!await checkFileExists(filePath)) return '';
    return await load(filePath);
}

export async function loadTemplates() {
    const templateFolders = await Neutralino.filesystem.readDirectory(
        'templates',
        { recursive: true }
    );
    for (const folder of templateFolders) {
        const template = await loadTemplateFile(folder, loadJson, 'template.json');
        if (!template) continue;
        template.folder = folder;
        template.css = await loadTemplateFile(folder, loadTextFile, 'template.css');
        template.html = await loadTemplateFile(folder, loadTextFile, 'template.html');
        template.formCSS = await loadTemplateFile(folder, loadTextFile, 'form.css');
        template.formHTML = await loadTemplateFile(folder, loadTextFile, 'form.html');
        if (!template.css || !template.html || !template.formHTML) {
            console.warn(`Incomplete template found at`, folder.path);
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
