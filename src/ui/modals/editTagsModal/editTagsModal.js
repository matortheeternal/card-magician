import { registerModal } from '../modalManager.js';
import Modal from '../Modal.js';
import { saveProjectTags } from '../../../domain/sets/saveProject.js';
import { getOpenedSetPath } from '../../../domain/sets/setManager.js';

const L = localize('edit-tags-modal');

export default class EditTagsModal extends Modal {
    static id = 'cm-edit-tags-modal';
    title = L`Edit Tags`;

    constructor() {
        super();
        this.debouncedSave = this.save.debounce(500);
    }

    connectedCallback() {
        super.connectedCallback();
        this.renderTags();
    }

    bind() {
        super.bind();
        this.addEventListener('cm-tag-changed', () => this.debouncedSave());
    }

    get onClickHandlers() {
        return {
            ...super.onClickHandlers,
            addTag: () => this.addTag()
        };
    }

    get tagsContainer() {
        return this.querySelector('div.tags-container');
    }

    renderTags() {
        for (const tag of this.data) {
            const element = document.createElement('cm-edit-tag');
            element.tag = tag;
            this.tagsContainer.appendChild(element);
        }
    }

    renderBody() {
        return (
            `<div class=tags-container>
                <div style="display: contents">
                    <div>Tag</div>
                    <div>Variant</div>
                    <div></div>
                </div>
            </div>`
        );
    }

    renderActions() {
        return (
            `<sl-button data-click-action="addTag">${L`Add Tag`}</sl-button>
            <sl-button data-click-action="close">${L`Close`}</sl-button>`
        );
    }

    addTag() {
        console.log('Add tag');
    }

    save() {
        const setFilePath = getOpenedSetPath();
        saveProjectTags(setFilePath);
    }
}

registerModal(EditTagsModal);
