import './skeletonEntry.js';

const L = localize('edit-skeleton-modal');

function getSize(entries) {
    let size = 0;
    for (const entry of Object.values(entries))
        size += Array.isArray(entry) ? getSize(entry) : entry.count || 1;
    return size;
}

export default class EditSkeletonModal extends Modal {
    static id = 'cm-edit-skeleton-modal';
    title = L`Edit Skeleton`;
    stats = {};

    get onClickHandlers() {
        return {
            ...super.onClickHandlers,
            load: this.load
        };
    }

    get fields() {
        return [this.localeField];
    }

    get modalBody() {
        return this.querySelector('.modal-body');
    }

    renderEntry(entry) {
        const element = document.createElement('cm-skeleton-entry');
        element.model = entry;
        return element;
    }

    renderNested(category, entries, depth) {
        return Object.entries(entries).map(([key, value]) => (
            Array.isArray(value)
                ? this.renderCategory(key, value, category, depth)
                : this.renderEntry(value)
        ));
    }

    renderAddEntry(entries, container) {
        const addEntry = document.createElement('div');
        addEntry.className = 'skeleton-add-entry';
        addEntry.innerHTML = 'Add entry';
        addEntry.onclick = function() {
            entries.push({
                count: 1,
                type: '',
                tags: [],
            });
            window.changed(entries, '');
        };
        container.appendChild(addEntry);
    }

    renderEntries(category, entries, container, depth) {
        container.innerHTML = '';
        this.renderNested(category, entries, depth + 1).forEach(element => {
            container.appendChild(element);
        });
        if (depth > 0) this.renderAddEntry(entries, container);
    }

    renderCategory(category, entries, parentCategory = '', depth = 0) {
        const count = getSize(entries);
        const details = document.createElement('details');
        const summary = document.createElement('summary');
        summary.innerHTML = `${category} (${count})`;
        details.appendChild(summary);
        const container = document.createElement('div');
        container.className = 'skeleton-entries-container';
        details.appendChild(container);
        this.watch([parentCategory, category].join('/'), entries, '', () => {
            const count = getSize(entries);
            summary.innerHTML = `${category} (${count})`;
            this.renderEntries(category, entries, container, depth);
        });
        this.renderEntries(category, entries, container, depth);
        return details;
    }

    renderBody() {
        return (
            `<style>
                .skeleton-entries-container {
                    margin-left: 1em;
                }

                cm-skeleton-entry {
                    display: grid;
                    grid-template-columns: auto auto auto auto;
                    grid-gap: 5px;
                }
            </style>`
        );
    }

    render() {
        super.render();
        for (const [category, entries] of Object.entries(this.data)) {
            const element = this.renderCategory(category, entries);
            this.modalBody.appendChild(element);
        }
    }

    load() {
        console.log('load');
    }

    renderActions() {
        return (
            `<sl-button data-click-action="load">${L`Load`}</sl-button>
             <sl-button data-click-action="close">${L`Close`}</sl-button>`
        );
    }
}
