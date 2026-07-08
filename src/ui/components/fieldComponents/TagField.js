import FieldComponent from './FieldComponent.js';
import { emit } from '../../../shared/htmlUtils.js';
import { registerField } from '../../systems/fieldComponentRegistry.js';
import { findOrCreateTag, searchTags } from '../../../domain/game/tagManager.js';

export default class TagField extends FieldComponent {
    static tagName = 'cm-tags';
    eventKey = 'sl-change';
    focusedOptionIndex = -1;
    onKeyDownHandlers = {
        Enter: () => this.handleEnter(),
        ArrowDown: event => this.handleArrowDown(event),
        ArrowUp: event => this.handleArrowUp(event),
    };

    static matches(field) {
        return field.type === 'tags';
    }

    bind() {
        super.bind();
        this.handleEvents('click', {
            onItemSelected: event => this.onItemSelected(event)
        });
        this.addEventListener('sl-remove', event => this.handleRemove(event));
        this.addEventListener('input', () => this.handleInput());
    }

    get tagsContainer() {
        return this.querySelector('.active-tags');
    }

    get textInput() {
        return this.querySelector('input[type="text"]');
    }

    get popup() {
        return this.querySelector('sl-popup');
    }

    get menu() {
        return this.querySelector('div.menu');
    }

    bindKeyDown() {
        this.textInput.addEventListener('keydown', event => {
            const handler = this.onKeyDownHandlers[event.key];
            handler?.(event);
        });
    }

    render() {
        this.innerHTML = (
            `<label class="form-control__label" aria-hidden="false">
                ${this.field.label}
            </label>
            <div class="input">
                <div class="active-tags"></div>
                <sl-popup
                    placement="bottom-start"
                    shift
                    shift-padding="22"
                    strategy="fixed"
                    auto-size="vertical"
                    auto-size-padding="5">
                    <input slot="anchor" type="text" placeholder="Add tag..." />
                    <div class="menu"></div>
                </sl-popup>
            </div>`
        );
        this.loadValue();
        this.bindKeyDown();
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
        this.addTag(event.target.value);
        this.popup.removeAttribute('active');
        this.textInput.value = '';
        this.textInput.focus();
    }

    handleEnter() {
        const value = this.focusedOptionIndex > -1
            ? this.querySelector('sl-option.active')?.value
            : this.textInput.value.trim();
        if (!value) return;
        this.addTag(value);
        this.popup.removeAttribute('active');
        this.textInput.value = '';
    }

    focusOption() {
        const options = Array.from(this.querySelectorAll('sl-option'));
        for (let i = 0; i < options.length; i++) {
            const active = this.focusedOptionIndex === i;
            options[i].classList.toggle('active', active);
        }
    }

    handleArrowDown(event) {
        event.preventDefault();
        this.focusedOptionIndex = Math.min(
            this.maxOptionIndex,
            this.focusedOptionIndex + 1
        );
        this.focusOption();
    }

    handleArrowUp(event) {
        event.preventDefault();
        this.focusedOptionIndex = Math.max(
            0,
            this.focusedOptionIndex - 1
        );
        this.focusOption();
    }

    generateNewTagItem(newTagText) {
        return (
            `<sl-option data-click-action="onItemSelected" value="${newTagText}">
                Add new tag "${newTagText}"
            </sl-option>`
        );
    }

    renderMenu(matches) {
        const newTagText = this.textInput.value.trim().toLowerCase().replaceAll(' ', '-');
        const menuItems = matches.map(tag => (
            `<sl-option data-click-action="onItemSelected" value="${tag.text}">
                ${tag.text}
            </sl-option>`
        ));
        if (!matches.some(tag => tag.text === newTagText))
            menuItems.push(this.generateNewTagItem(newTagText));
        this.menu.innerHTML = menuItems.join('\n');
        this.maxOptionIndex = menuItems.length - 1;
        this.focusedOptionIndex = -1;
        this.popup.setAttribute('active', '');
    }

    handleInput() {
        if (!this.textInput.value.trim().length) {
            this.popup.removeAttribute('active');
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
