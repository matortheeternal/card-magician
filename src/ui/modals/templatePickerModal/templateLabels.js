import { escapeHTML } from '../../../shared/htmlUtils.js';

const L = localize('template-picker');

export function templateLabel(template) {
    if (!template.label) return escapeHTML(template.id);
    const label = L([template.label]);
    return label === template.label ? escapeHTML(label) : label;
}

export function templateFamily(template) {
    return template.family || template.id.split('/').slice(1, -1).join(' / ');
}
