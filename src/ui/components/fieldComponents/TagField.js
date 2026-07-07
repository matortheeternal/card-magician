import FieldComponent from './FieldComponent.js';
import { emit, hide, show } from '../../../shared/htmlUtils.js';
import { registerField } from '../../systems/fieldComponentRegistry.js';
import { findOrCreateTag, searchTags } from '../../../domain/game/tagManager.js';

export default class TagField extends FieldComponent {
    static tagName = 'cm-tags';
    eventKey = 'sl-change';


    static matches(field) {
        return field.type === 'tags';
    }

    bind() {
        super.bind();
        this.addEventListener('sl-remove', event => this.handleRemove(event));
        this.addEventListener('keydown', event => this.handleKeyDown(event));
        this.addEventListener('sl-select', event => this.onItemSelected(event));
        this.addEventListener('input', () => this.handleInput());
    }

    get tagsContainer() {
        return this.querySelector('.active-tags');
    }

    get textInput() {
        return this.querySelector('input[type="text"]');
    }

    get menu() {
        return this.querySelector('sl-menu');
    }

    render() {
        this.innerHTML = (
            `<label class="form-control__label" aria-hidden="false">
                ${this.field.label}
            </label>
            <div class="input">
                <div class="active-tags"></div>
                <input type="text" placeholder="Add tag..." />
                <sl-menu style="display: none; "></sl-menu>
            </div>`
        );
        this.loadValue();
    }

    createTagElement(tagText) {
        const tag = findOrCreateTag(tagText);
        const el = document.createElement('sl-tag');
        el.setAttribute('removable', '');
        el.setAttribute('size', 'small');
        el.setAttribute('variant', tag.variant || 'neutral');
        el.textContent = tagText;
        return el;
    }

    loadValue() {
        const container = this.tagsContainer;
        if (!container) return;
        container.innerHTML = '';
        if (!Array.isArray(this.value)) return;
        for (const tag of this.value) {
            const el = this.createTagElement(tag);
            container.appendChild(el);
        }
    }

    addTag(tagText) {
        if (this.value.includes(tagText)) return;
        const el = this.createTagElement(tagText);
        this.tagsContainer.appendChild(el);
        emit(this, 'sl-change');
    }

    onItemSelected(event) {
        const item = event.detail.item;
        this.addTag(item.value);
        hide(this.menu);
        this.textInput.value = '';
        this.textInput.focus();
    }

    handleKeyDown(event) {
        if (event.key !== 'Enter') return;
        const value = this.textInput.value.trim();
        if (!value) return;
        this.addTag(value);
        hide(this.menu);
        this.textInput.value = '';
    }

    generateNewTagItem(newTagText) {
        return (
            `<sl-menu-item value="${newTagText}">
                Add new tag "${newTagText}"
            </sl-menu-item>`
        );
    }

    renderMenu(matches) {
        const newTagText = this.textInput.value.trim().toLowerCase().replaceAll(' ', '-');
        const menuItems = matches.map(tag => {
            return `<sl-menu-item value="${tag.text}">${tag.text}</sl-menu-item>`;
        });
        if (!matches.some(tag => tag.text === newTagText))
            menuItems.push(this.generateNewTagItem(newTagText));
        this.menu.innerHTML = menuItems.join('\n');
        show(this.menu);
    }

    handleInput() {
        if (!this.textInput.value.trim().length) {
            hide(this.menu);
            return;
        }

        const matches = searchTags(this.textInput.value);
        this.renderMenu(matches);
    }

    handleRemove(event) {
        event.target.remove();
        emit(this, 'sl-change');
    }

    async getChangedValue() {
        const tags = [];
        for (const child of this.tagsContainer.children)
            tags.push(child.textContent.trim());
        return tags;
    }
}

registerField(TagField);
