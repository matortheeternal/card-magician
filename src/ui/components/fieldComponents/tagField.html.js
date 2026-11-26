import { esc } from '../../../shared/htmlUtils.js';

const L = localize('tag-field');

export default function renderTagField(label) {
    return `
        <label class="form-control__label">${label}</label>
        <div class="input">
            <div class="active-tags"></div>
            <div class="inherited-tag-items" hidden></div>
            <button class="inherited-toggle" type="button" hidden
                    data-click-action="toggleInherited"></button>
            <sl-popup
                placement="bottom-start"
                shift
                shift-padding="22"
                strategy="fixed"
                auto-size="vertical"
                auto-size-padding="5">
                <input slot="anchor" type="text" placeholder="${esc(L`Add tag...`)}" />
                <div class="menu"></div>
            </sl-popup>
        </div>
        <div class="tag-suggestions" role="group" hidden
             aria-label="${esc(L`Tag suggestions`)}">
            <span class="tag-suggestion-label">${L`Suggestions`}</span>
            <span class="tag-suggestion-items"></span>
            <sl-button size="small" variant="text" hidden
                       data-click-action="toggleSuggestions"></sl-button>
        </div>`;
}
