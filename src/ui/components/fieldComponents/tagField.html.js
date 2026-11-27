import { esc, escapeHTML } from '../../../shared/htmlUtils.js';
import { tagStyle } from '../../../domain/game/tagManager.js';

const L = localize('tag-field');

export function renderTagSuggestion(tag) {
    return (
        `<sl-tag size="small" data-tag-style="${tagStyle(tag)}"
                data-suggested-tag="${esc(tag)}">
            <sl-icon-button name="plus-lg" data-click-action="acceptSuggestion"
                label="${esc(L`Add suggested tag ${tag}`)}"></sl-icon-button>
            ${escapeHTML(tag)}
            <sl-icon-button name="x-lg" data-click-action="dismissSuggestion"
                label="${esc(L`Dismiss suggested tag ${tag}`)}"></sl-icon-button>
        </sl-tag>`
    );
}

export default function renderTagField(label) {
    return `
        <label class="form-control__label">${label}</label>
        <div class="input">
            <div class="active-tags"></div>
            <sl-tooltip>
                <button class="inherited-toggle" type="button" hidden
                        data-click-action="toggleInherited">
                    <sl-icon name="chevron-right"></sl-icon>
                    <span></span>
                </button>
            </sl-tooltip>
            <div class="inherited-tag-items" hidden></div>
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
