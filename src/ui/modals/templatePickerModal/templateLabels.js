import { escapeHTML } from '../../../shared/htmlUtils.js';

const L = localize('template-picker');

export function templateLabel(template) {
    if (!template.label) return escapeHTML(template.id);
    const label = L([template.label]);
    return label === template.label ? escapeHTML(label) : label;
}
