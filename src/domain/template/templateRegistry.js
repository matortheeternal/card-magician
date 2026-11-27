import { readExtensionDirectories } from '../../shared/extensionManager.js';

import { AUTO_TEMPLATE, matchAutoTemplate } from './autoTemplate.js';

const templates = [];

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
    for (const folder of templateFolders) {
        const template = await loadTemplateFile(folder, 'template.json');
        if (!template) continue;
        template.folder = folder;
        Object.assign(template, await loadTemplateView(folder, 'template'));
        template.form = await loadTemplateView(folder, 'form');
        template.options = await loadTemplateView(folder, 'options');
        if (!template.html || !template.form.html) {
            log('plugin').warn(`Incomplete template found at`, folder.url());
            continue;
        }
        if (await folder.exists('icon.webp')) template.iconUrl = folder.url('icon.webp');
        templates.push(template);
    }
    sortTemplates();
}

export function getTemplate(templateId) {
    return templates.find(template => template.id === templateId)
        ?? templates.find(template =>
            Array.isArray(template.previously) && template.previously.includes(templateId)
        )
        ?? templates.find(template => {
            const oldTemplateId = template.id.split('/').slice(1).join('');
            return oldTemplateId === templateId;
        });
}

export function getTemplates() {
    return templates.slice();
}

export function getGameTemplates(gameId) {
    return templates.filter(template => template.gameId === gameId);
}

export function getTemplateFamily(template) {
    return template?.family || template?.id.split('/').slice(1, -1).join(' / ') || '';
}

export function getFamilyDefaults(gameId) {
    return getGameTemplates(gameId).filter(template => template.familyDefault);
}

export function getPreferredTemplateDefault(
    game = activeGame, project = window.activeProject
) {
    const family = project?.preferredTemplateFamily;
    return getFamilyDefaults(game.id)
        .find(template => getTemplateFamily(template) === family)
        ?? getTemplate(game.defaultTemplateId);
}

export function resolveFaceTemplate(
    face, game = activeGame, project = window.activeProject
) {
    if (face.template !== AUTO_TEMPLATE)
        return getTemplate(face.template ?? game.defaultTemplateId);
    const fallback = getPreferredTemplateDefault(game, project);
    const family = getTemplateFamily(fallback);
    const candidates = getGameTemplates(game.id)
        .filter(template => getTemplateFamily(template) === family);
    return matchAutoTemplate(candidates, face) ?? fallback;
}
