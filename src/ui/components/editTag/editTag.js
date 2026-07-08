import ReactiveComponent from '../ReactiveComponent.js';
import { emit } from '../../../shared/htmlUtils.js';
import editTagFields from './editTagFields.js';
import { deleteTag } from '../../../domain/game/tagManager.js';
import { removeTagFromSet } from '../../../domain/sets/setManager.js';

export default class EditTag extends ReactiveComponent {
    #tag = null;

    connectedCallback() {
        this.setAttribute('data-form-provider', '');
        this.render();
        this.bind();
    }

    bind() {
        this.handleEvents('click', {
            onRemoveClick: () => this.onRemoveClick()
        });
        this.addEventListener('cm-field-changed', () => this.onChange());
    }

    set tag(value) { this.#tag = value; }
    get tag() { return this.#tag; }
    get model() { return this.#tag; }
    get fields() { return editTagFields; }

    get tagElement() {
        return this.querySelector('sl-tag');
    }

    async render() {
        this.innerHTML = (
            `<div>
                <sl-tag size="medium" variant="${this.tag.variant}">
                    ${this.tag.text}
                </sl-tag>
            </div>
            <form-field field-id="variant"></form-field>
            <sl-button
                size="small"
                variant="danger"
                data-click-action="onRemoveClick"
                outline
            >
                Delete
            </sl-button>`
        );
    }

    onRemoveClick() {
        removeTagFromSet(this.tag);
        deleteTag(this.tag);
        this.remove();
    }

    onChange() {
        this.tagElement.variant = this.model.variant;
        emit(this, 'cm-tag-changed');
    }
}

customElements.define('cm-edit-tag', EditTag);
