import { checkFileExists, loadTextFile } from '../../shared/fsUtils.js';
import { readDirectory } from '../../shared/wailsAdapter.js';

const templates = [];

async function loadTemplateFile(templateFolder, filename) {
    const filePath = ['.', templateFolder.path, filename].join('/');
    if (!await checkFileExists(filePath)) return '';
    const text = await loadTextFile(filePath);
    return filePath.endsWith('.json') ? JSON.parse(text) : text;
}

async function loadTemplateView(templateFolder, baseName) {
    return {
        css: await loadTemplateFile(templateFolder, `${baseName}.css`),
        html: await loadTemplateFile(templateFolder, `${baseName}.html`)
    };
}

export async function loadTemplates() {
    const templateFolders = await readDirectory(
        'templates',
        { recursive: true }
    );
    for (const folder of templateFolders) {
        const template = await loadTemplateFile(folder, 'template.json');
        if (!template) continue;
        template.folder = folder;
        Object.assign(template, await loadTemplateView(folder, 'template'));
        template.form = await loadTemplateView(folder, 'form');
        template.options = await loadTemplateView(folder, 'options');
        if (!template.css || !template.html || !template.form.html) {
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
