import './skeletonEntryList.js';

export default class SkeletonCategory extends window.ReactiveComponent {
    #entries;

    connectedCallback() {
        this.render();
        this.bind();
    }

    bind() {
        this.addEventListener('cm-count-changed', () => {
            this.renderSummary();
        });
        if (this.isSuperCategory) return;
        this.handleEvents('click', {
            addEntry: event => this.onAddEntry(event)
        });
        this.addEventListener('entry-removed', event => {
            this.onEntryRemoved(event);
        });
        this.addEventListener('cm-field-changed', () => {
            this.emit('cm-count-changed');
        });
    }

    get entries() {
        return this.#entries;
    }

    set entries(entries) {
        this.#entries = entries;
        this.watch('entries', entries, '', () => {
            this.renderSummary();
            this.renderEntries();
        });
    }

    get isSuperCategory() {
        return !Array.isArray(this.entries);
    }

    get summary() {
        return this.querySelector('summary');
    }

    get entriesContainer() {
        return this.querySelector('.skeleton-entries-container');
    }

    getSize(entries) {
        let size = 0;
        for (const entry of Object.values(entries || this.entries))
            size += Array.isArray(entry) ? this.getSize(entry) : Number(entry.count) || 1;
        return size;
    }

    renderSummary() {
        this.summary.innerHTML = `${this.category} (${this.getSize()})`;
    }

    createEntry(key, value) {
        if (this.isSuperCategory) {
            const element = document.createElement('cm-skeleton-category');
            element.category = key;
            element.entries = value;
            return element;
        }

        const element = document.createElement('cm-skeleton-entry');
        element.model = value;
        return element;
    }

    renderAddEntry() {
        const addEntry = document.createElement('sl-button');
        addEntry.setAttribute('data-click-action', 'addEntry');
        addEntry.innerHTML = 'Add Entry';
        this.entriesContainer.appendChild(addEntry);
    }

    renderEntries() {
        this.entriesContainer.innerHTML = '';
        for (const [key, value] of Object.entries(this.entries)) {
            const element = this.createEntry(key, value);
            this.entriesContainer.appendChild(element);
        }
        if (!this.isSuperCategory) this.renderAddEntry();
    }

    render() {
        this.innerHTML = (
            `<details>
                <summary></summary>
                <div class="skeleton-entries-container"></div>
            </details>`
        );
        this.renderSummary();
        this.renderEntries();
    }

    emit(name) {
        const event = new CustomEvent(name, {
            bubbles: true,
            composed: true,
            cancelable: false
        });
        this.dispatchEvent(event);
    }

    onAddEntry(event) {
        event.stopPropagation();
        this.entries.push({
            count: 1,
            type: '',
            tags: ''
        });
        window.changed(this.entries);
        this.emit('cm-count-changed');
    }

    onEntryRemoved(event) {
        event.stopImmediatePropagation();
        this.entries.remove(event.detail);
        window.changed(this.entries);
        this.emit('cm-count-changed');
    }
}

customElements.define('cm-skeleton-category', SkeletonCategory);
