import renderTagField from './tagField.html.js';
import FieldComponent from './FieldComponent.js';
import { emit, esc, escapeHTML } from '../../../shared/htmlUtils.js';
import { registerField } from '../../systems/fieldComponentRegistry.js';
import {
    findTag, rememberTag, searchTags, tagManager, tagStyle
} from '../../../domain/game/tagManager.js';

const L = localize('tag-field');
const INITIAL_SUGGESTION_LIMIT = 6;

export default class TagField extends FieldComponent {
    static tagName = 'cm-tags';
    focusedOptionIndex = -1;
    suggestionsExpanded = false;
    inheritedExpanded = false;
    onKeyDownHandlers = {
        Enter: () => this.handleEnter(),
        ArrowDown: event => this.handleArrowDown(event),
        ArrowUp: event => this.handleArrowUp(event),
    };

    static matches(field) {
        return field.type === 'tags';
    }

    bind() {
        this.handleEvents('click', {
            onItemSelected: event => this.onItemSelected(event),
            toggleSuggestions: () => this.toggleSuggestions(),
            toggleInherited: () => {
                this.inheritedExpanded = !this.inheritedExpanded;
                this.updateInheritedToggle();
            },
            acceptSuggestion: event => this.addTag(this.getSuggestionTag(event)),
            dismissSuggestion: event => {
                this.dismissSuggestion(this.getSuggestionTag(event));
            }
        });
        this.addEventListener('sl-remove', event => this.handleRemove(event));
        this.addEventListener('input', () => this.handleInput());
        this.watch('tag-styles', tagManager, 'tags', () => this.loadValue());
        this.bindSuggestions();
    }

    bindSuggestions() {
        const assistance = window.activeGame?.oracleAssistance;
        const config = window.activeGame?.config;
        if (!assistance || !config) return;
        const refresh = () => this.renderSuggestions();
        this.watch('suggestion-setting', config, 'suggestOracleTags', refresh);
        const { definitionFields } = assistance;
        const project = window.activeProject;
        if (project && definitionFields?.length)
            this.watch('tag-definitions', project, definitionFields, refresh);
        this.watch('dismissed-tags', this.model, 'dismissedTags', refresh);
        const fields = ['rulesText', ...assistance.faceFields];
        for (const [index, face] of assistance.getSuggestionModels(this.model).entries())
            this.watch(`suggestion-face-${index}`, face, fields, refresh);
    }

    get suggestionsContainer() {
        return this.querySelector('.tag-suggestions');
    }

    get suggestionItems() {
        return this.querySelector('.tag-suggestion-items');
    }

    get suggestionToggle() {
        return this.querySelector('[data-click-action="toggleSuggestions"]');
    }

    get inheritedToggle() {
        return this.querySelector('[data-click-action="toggleInherited"]');
    }

    get inheritedTagItems() {
        return this.querySelector('.inherited-tag-items');
    }

    get appliedTags() {
        return Array.isArray(this.value) ? this.value : [];
    }

    get tagRelationships() {
        return window.activeGame?.tagRelationships;
    }

    get suggestions() {
        if (!window.activeGame?.config?.get('suggestOracleTags')) return [];
        const assistance = window.activeGame?.oracleAssistance;
        const tags = assistance?.suggestTags(this.model) ?? [];
        const dismissed = this.model?.dismissedTags ?? [];
        const relationships = this.tagRelationships;
        const canonicalTag = relationships?.canonicalTag ?? (tag => tag);
        const overrides = this.model?.excludedInheritedTags ?? [];
        const excluded = new Set(
            [...this.appliedTags, ...dismissed, ...overrides].map(canonicalTag)
        );
        const available = tags.map(canonicalTag)
            .filter(tag => !excluded.has(tag) && !findTag(tag)?.hidden);
        return relationships?.specificTags(available) ?? available;
    }

    renderSuggestion(tag) {
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

    renderSuggestions() {
        const suggestions = this.suggestions;
        this.suggestionsContainer.hidden = !suggestions.length;
        const visible = this.suggestionsExpanded
            ? suggestions
            : suggestions.slice(0, INITIAL_SUGGESTION_LIMIT);
        this.suggestionItems.innerHTML = visible.map(tag => this.renderSuggestion(tag))
            .join('');
        const toggle = this.suggestionToggle;
        const overflow = suggestions.length - INITIAL_SUGGESTION_LIMIT;
        toggle.hidden = overflow <= 0;
        toggle.setAttribute('aria-expanded', String(this.suggestionsExpanded));
        toggle.textContent = this.suggestionsExpanded
            ? L`Show fewer`
            : L`Show ${overflow} more`;
    }

    renderAppliedTags() {
        const sources = this.tagRelationships?.inheritedTagSources(this.appliedTags, {
            includeAssigned: true
        });
        this.tagsContainer.replaceChildren();
        this.inheritedTagItems.replaceChildren();
        for (const text of this.appliedTags) {
            const tag = this.createTagElement(text);
            const parents = sources?.get(text);
            if (!parents?.length) {
                this.tagsContainer.appendChild(tag);
                continue;
            }
            tag.title = L`Implied by ${parents.join(', ')}`;
            this.inheritedTagItems.appendChild(tag);
        }
        this.updateInheritedToggle();
    }

    updateInheritedToggle() {
        const count = this.inheritedTagItems.childElementCount;
        const toggle = this.inheritedToggle;
        const expanded = this.inheritedExpanded && count > 0;
        this.inheritedTagItems.hidden = !expanded;
        toggle.hidden = count === 0;
        toggle.setAttribute('aria-expanded', String(expanded));
        toggle.textContent = expanded ? L`Hide inherited` : L`Show inherited`;
    }

    toggleSuggestions() {
        this.suggestionsExpanded = !this.suggestionsExpanded;
        this.renderSuggestions();
    }

    getSuggestionTag(event) {
        return event.target.closest('[data-suggested-tag]').dataset.suggestedTag;
    }

    dismissSuggestion(tag) {
        const oldValue = this.model.dismissedTags ?? [];
        if (oldValue.includes(tag)) return;
        const newValue = [...oldValue, tag];
        this.model.dismissedTags = newValue;
        changed(this.model, 'dismissedTags');
        emit(this, 'cm-field-changed', { fieldId: 'dismissedTags', oldValue, newValue });
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
        this.innerHTML = renderTagField(this.field.label);
        this.loadValue();
        this.bindKeyDown();
    }

    createTagElement(tagText) {
        const el = document.createElement('sl-tag');
        el.setAttribute('removable', '');
        el.setAttribute('size', 'small');
        el.dataset.tagStyle = tagStyle(tagText);
        el.textContent = tagText;
        return el;
    }

    loadValue() {
        if (!this.tagsContainer) return;
        for (const tag of this.appliedTags) rememberTag(tag);
        this.renderAppliedTags();
        this.renderSuggestions();
    }

    editTags(added, removed) {
        const oldValue = this.appliedTags;
        const edit = window.activeGame?.editCardTags;
        const updates = edit?.(this.model, added, removed) ?? {
            tags: [...new Set([...oldValue.filter(tag => tag !== removed), ...added])]
        };
        const { tags: newValue, ...metadata } = updates;
        if (newValue.length === oldValue.length
            && newValue.every((tag, index) => tag === oldValue[index])) return;
        for (const [key, value] of Object.entries(metadata))
            if (value.length || Object.hasOwn(this.model, key)) this.model[key] = value;
        this.value = newValue;
        this.field.onChange?.(this.model, newValue);
        emit(this, 'cm-field-changed', { fieldId: this.field.id, oldValue, newValue });
    }

    addTag(tagText) {
        if (this.appliedTags.includes(tagText)) return;
        this.editTags([tagText]);
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

    inputValue(value) {
        this.editTags(value);
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
        this.editTags([], event.target.textContent.trim());
    }
}

registerField(TagField);
