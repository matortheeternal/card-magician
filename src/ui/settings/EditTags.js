import CardMagicianSettings from './CardMagicianSettings.js';
import editTagFields from '../components/editTag/editTagFields.js';
import {
    findTag,
    findOrCreateTag,
    getTags,
    deleteTag,
} from '../../domain/game/tagManager.js';
import { registerSettings } from './settingsRegistry.js';
import { removeTagFromSet } from '../../domain/projects/projectManager.js';

const L = localize('settings');

export default class EditTags extends CardMagicianSettings {
    static id = 'cm-edit-tags';
    static parentId = 'cm-project-settings';
    static label = L`Tags`;
    static groupWeight = 896;

    static search(query) {
        return editTagFields.filter(field => {
            return this.fieldMatches(field, query);
        });
    }

    get tagsContainer() {
        return this.querySelector('div.tags-container');
    }

    get model() {
        return getTags();
    }

    bind() {
        this.handleEvents('click', {
            addTag: () => this.addTag()
        });
        this.addEventListener('remove-tag', event => {
            removeTagFromSet(event.detail.tag);
            deleteTag(event.detail.tag);
            this.emit('project-changed');
        });
    }

    renderTag(tag) {
        const element = document.createElement('cm-edit-tag');
        element.tag = tag;
        this.tagsContainer.appendChild(element);
    }

    renderTags() {
        for (const tag of this.model)
            this.renderTag(tag);
    }

    render() {
        this.innerHTML = (
            `<div class="header">
                <p class="text-muted">
                    ${L`Edit tags for use in this project.`}
                </p>
                <sl-button data-click-action="addTag" variant="primary">
                    <sl-icon slot="prefix" name="plus-lg"></sl-icon>
                    ${L`Add Tag`}
                </sl-button>
            </div>
            <div class=tags-container>
                <div style="display: contents">
                    <div>Tag</div>
                    <div>Variant</div>
                    <div></div>
                </div>
            </div>`
        );
        this.renderTags();
    }

    addTag() {
        const text = prompt(L`Enter tag name`);
        if (!text) return;
        if (findTag(text)) {
            alert(L`Tag ${text} already exists.`);
            return;
        }
        const tag = findOrCreateTag(text);
        this.renderTag(tag);
        this.emit('project-changed');
    }
}

registerSettings(EditTags);
