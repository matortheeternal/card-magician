import ReactiveComponent from '../ReactiveComponent.js';
import { esc, escapeHTML } from '../../../shared/htmlUtils.js';
import { tagStyles } from '../../../domain/game/tagStyles.js';

const L = localize('tag-style-board');

export default class TagStyleBoard extends ReactiveComponent {
    #tags = [];
    #selectedTag = '';
    #draggedTag = null;
    #dropTarget = null;

    connectedCallback() {
        this.render();
        this.bind();
    }

    set tags(tags) {
        this.#tags = tags;
        if (!this.isConnected) return;
        if (!tags.some(tag => tag.text === this.#selectedTag)) this.#selectedTag = '';
        this.renderGroups();
        this.updateStyleControl();
    }

    get groups() {
        return this.querySelector('.tag-style-groups');
    }

    get searchInput() {
        return this.querySelector('sl-input');
    }

    get styleSelect() {
        return this.querySelector('sl-select');
    }

    get selectionLabel() {
        return this.querySelector('.tag-style-selection');
    }

    bind() {
        this.handleEvents('click', {
            selectTag: event => this.selectTag(this.tagNameFrom(event)),
            removeTag: event => this.emit('remove-tag', this.tagNameFrom(event))
        });
        this.on('sl-input', () => this.renderGroups());
        this.on('sl-change', event => {
            if (event.target !== this.styleSelect || !this.#selectedTag) return;
            this.moveTag(this.#selectedTag, this.styleSelect.value);
        });
        this.on('dragstart', event => this.startDrag(event));
        this.on('dragover', event => this.dragOver(event));
        this.on('drop', event => this.drop(event));
        this.on('dragend', () => this.endDrag());
    }

    tagNameFrom(event) {
        return event.target.closest('[data-tag]')?.dataset.tag;
    }

    startDrag(event) {
        const tag = this.tagNameFrom(event);
        if (!tag) return;
        this.#draggedTag = tag;
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', tag);
    }

    dragOver(event) {
        const group = event.target.closest('[data-style-group]');
        if (!this.#draggedTag || !group) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        if (group === this.#dropTarget) return;
        this.#dropTarget?.removeAttribute('data-drag-over');
        this.#dropTarget = group;
        group.setAttribute('data-drag-over', '');
    }

    drop(event) {
        const group = event.target.closest('[data-style-group]');
        if (!this.#draggedTag || !group) return;
        event.preventDefault();
        const tag = this.#draggedTag;
        this.endDrag();
        this.moveTag(tag, group.dataset.styleGroup);
    }

    endDrag() {
        this.#dropTarget?.removeAttribute('data-drag-over');
        this.#dropTarget = null;
        this.#draggedTag = null;
    }

    moveTag(text, style) {
        const tag = this.#tags.find(tag => tag.text === text);
        if (!tag || tag.style === style) return;
        this.emit('move-tag', { text, style });
    }

    selectTag(text) {
        this.#selectedTag = text;
        const buttons = this.groups.querySelectorAll('[data-click-action="selectTag"]');
        for (const button of buttons) {
            const selected = button.parentElement.dataset.tag === text;
            button.setAttribute('aria-pressed', String(selected));
        }
        this.updateStyleControl();
    }

    updateStyleControl() {
        const selected = this.#tags.find(tag => tag.text === this.#selectedTag);
        this.styleSelect.disabled = !selected;
        this.styleSelect.value = selected?.style ?? '';
        this.selectionLabel.textContent = selected
            ? L`Style for ${selected.text}`
            : L`Select a tag to change its style`;
    }

    renderTag({ text, style }) {
        const selected = text === this.#selectedTag;
        return `
            <span class="tag-style-chip" data-tag-style="${style}"
                  data-tag="${esc(escapeHTML(text))}" draggable="true">
                <button type="button" data-click-action="selectTag"
                        aria-pressed="${selected}">${escapeHTML(text)}</button>
                <button type="button" data-click-action="removeTag"
                        aria-label="${esc(escapeHTML(L`Remove tag ${text}`))}">×</button>
            </span>`;
    }

    renderGroup({ id, label }, tags) {
        const items = tags.map(tag => this.renderTag(tag)).join('');
        return `
            <section data-style-group="${id}">
                <h3>
                    <span class="tag-style-chip" data-tag-style="${id}">${label}</span>
                </h3>
                <div class="tag-style-items">${items}</div>
            </section>`;
    }

    renderGroups() {
        const query = (this.searchInput.value ?? '').trim().toLowerCase();
        const groups = new Map(tagStyles.map(style => [style.id, []]));
        for (const tag of this.#tags) {
            if (!tag.text.toLowerCase().includes(query)) continue;
            groups.get(tag.style).push(tag);
        }
        this.groups.innerHTML = tagStyles
            .map(style => this.renderGroup(style, groups.get(style.id))).join('');
    }

    renderStyleOptions() {
        return tagStyles.map(({ id, label }) =>
            `<sl-option value="${id}">${label}</sl-option>`).join('');
    }

    render() {
        this.innerHTML = `
            <div class="tag-style-controls">
                <sl-input size="small" clearable
                          label="${esc(L`Filter tags`)}"></sl-input>
                <sl-select size="small">
                    <span slot="label" class="tag-style-selection"></span>
                    ${this.renderStyleOptions()}
                </sl-select>
            </div>
            <div class="tag-style-groups"></div>`;
        this.renderGroups();
        this.updateStyleControl();
    }
}

customElements.define('cm-tag-style-board', TagStyleBoard);
