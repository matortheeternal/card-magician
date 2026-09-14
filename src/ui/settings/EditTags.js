import CardMagicianSettings from './CardMagicianSettings.js';
import editTagFields from '../components/editTag/editTagFields.js';
import { getTags, saveTags } from '../../domain/game/tagManager.js';
import { registerSettings } from './settingsRegistry.js';

const L = localize('settings');

export default class EditTags extends CardMagicianSettings {
    static id = 'cm-edit-tags';
    static parentId = 'cm-project-settings';
    static label = L`Tags`;
    static groupWeight = 896;

    static createModel() {
        return getTags();
    }

    static apply(model) {
        saveTags(model);
    }

    static search(query) {
        return editTagFields.filter(field => {
            return this.fieldMatches(field, query);
        });
    }

    get tagsContainer() {
        return this.querySelector('div.tags-container');
    }

    renderTags() {
        for (const tag of this.model) {
            const element = document.createElement('cm-edit-tag');
            element.tag = tag;
            this.tagsContainer.appendChild(element);
        }
    }

    render() {
        this.innerHTML = (
            `<div class=tags-container>
                <div style="display: contents">
                    <div>Tag</div>
                    <div>Variant</div>
                    <div></div>
                </div>
            </div>`
        );
        this.renderTags();
    }
}

registerSettings(EditTags);
