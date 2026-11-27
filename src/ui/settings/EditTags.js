import CardMagicianSettings from './CardMagicianSettings.js';
import '../components/editTag/TagStyleBoard.js';
import {
    findOrCreateTag, findTag, getTags, hideTag, setTagStyle, tagStyle
} from '../../domain/game/tagManager.js';
import { projectTagNames } from '../../domain/game/projectTagNames.js';
import { registerSettings } from './settingsRegistry.js';

const L = localize('settings');

export default class EditTags extends CardMagicianSettings {
    static id = 'cm-edit-tags';
    static parentId = 'cm-magic-settings';
    static label = L`Tags`;
    static groupWeight = 896;

    static search(query) {
        const field = { label: L`Tag styles` };
        return this.fieldMatches(field, query) ? [field] : [];
    }

    get board() {
        return this.querySelector('cm-tag-style-board');
    }

    get projectOnlyToggle() {
        return this.querySelector('sl-switch');
    }

    get emptyMessage() {
        return this.querySelector('.no-project-tags');
    }

    bind() {
        this.handleEvents('click', { addTag: () => this.addTag() });
        this.on('sl-change', event => {
            if (event.target === this.projectOnlyToggle) this.refreshTags();
        });
        this.on('move-tag', event => this.moveTag(event.detail));
        this.on('remove-tag', event => this.removeTag(event.detail));
    }

    visibleTagNames() {
        const names = projectTagNames();
        const catalog = this.projectOnlyToggle.checked ? [] : getTags();
        for (const { text } of catalog) names.add(text);
        return [...names].filter(text => !findTag(text)?.hidden);
    }

    refreshTags() {
        const tags = this.visibleTagNames()
            .map(text => ({ text, style: tagStyle(text) }))
            .sort((a, b) => a.text.localeCompare(b.text));
        this.board.tags = tags;
        const empty = this.projectOnlyToggle.checked && !tags.length;
        this.board.hidden = empty;
        this.emptyMessage.hidden = !empty;
    }

    render() {
        const filterState = window.activeProject ? 'checked' : 'disabled';
        this.innerHTML = `
            <div class="header">
                <p class="text-muted">
                    ${L`Drag tags between styles or select a tag and choose a style.`}
                </p>
                <sl-button data-click-action="addTag" variant="primary">
                    <sl-icon slot="prefix" name="plus-lg"></sl-icon>
                    ${L`Add Tag`}
                </sl-button>
            </div>
            <sl-switch ${filterState}>${L`Used in this project`}</sl-switch>
            <p class="no-project-tags text-muted" hidden>
                ${L`No tags are in use in this project.`}
            </p>
            <cm-tag-style-board></cm-tag-style-board>`;
        this.refreshTags();
    }

    async addTag() {
        const text = (await dialog.prompt(L`Enter tag name`))?.trim();
        if (!text) return;
        if (getTags().some(tag => tag.text === text)) {
            await dialog.alert(L`Tag ${text} already exists.`);
            return;
        }
        findOrCreateTag(text);
        this.projectOnlyToggle.checked = false;
        this.refreshTags();
    }

    moveTag({ text, style }) {
        setTagStyle(text, style);
        this.refreshTags();
    }

    async removeTag(text) {
        if (!await dialog.confirm(L`Remove tag ${text} from the tag catalog?`)) return;
        hideTag(text);
        this.refreshTags();
    }
}

registerSettings(EditTags);
