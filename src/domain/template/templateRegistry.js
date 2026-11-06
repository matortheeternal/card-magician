import { readExtensionDirectories } from '../../shared/extensionManager.js';

export const templateRegistry = { templates: [] };
const templates = templateRegistry.templates;

async function loadTemplateFile(templateFolder, filename) {
    if (!await templateFolder.exists(filename)) return '';
    return filename.endsWith('.json') ? templateFolder.readJson(filename)
        : templateFolder.readText(filename);
}

async function loadTemplateView(templateFolder, baseName) {
    const css = await loadTemplateFile(templateFolder, `${baseName}.css`);
    const html = await loadTemplateFile(templateFolder, `${baseName}.html`);
    return { css, html };
}

function sortTemplates() {
    templates.sort((a, b) => {
        if (a.label < b.label) return -1;
        if (a.label > b.label) return 1;
        return 0;
    });
}

export async function loadTemplates() {
    const templateFolders = await readExtensionDirectories(
        'templates',
        { recursive: true }
    );
    for (const folder of templateFolders) await registerTemplate(folder);
}

async function readTemplate(folder) {
    const template = await loadTemplateFile(folder, 'template.json');
    if (!template) return null;
    template.folder = folder;
    Object.assign(template, await loadTemplateView(folder, 'template'));
    template.form = await loadTemplateView(folder, 'form');
    template.options = await loadTemplateView(folder, 'options');
    if (!template.css || !template.html || !template.form.html) {
        log('plugin').warn('Incomplete template found at', folder.url());
        return null;
    }
    return template;
}

export async function registerTemplate(folder) {
    const template = await readTemplate(folder);
    if (!template) return null;
    const index = templates.findIndex(entry => entry.id === template.id);
    if (index !== -1) templates.splice(index, 1);
    templates.push(template);
    sortTemplates();
    changed(templateRegistry, 'templates');
    return template;
}

export function getTemplate(templateId) {
    return templates.find(t => {
        if (t.id === templateId) return true;
        const oldTemplateId = t.id.split('/').slice(1).join('');
        return oldTemplateId === templateId;
    });
}

export function getTemplates() {
    return templates.slice();
}
