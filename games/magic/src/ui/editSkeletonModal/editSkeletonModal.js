import './skeletonCategory.js';

const L = localize('edit-skeleton-modal');

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

    renderBody() {
        return (
            `<style>
                .skeleton-entries-container {
                    padding: 1em;
                }

                details {
                    border: 1px solid var(--sl-input-border-color);
                    margin-bottom: var(--sl-spacing-small);
                }

                summary {
                    padding: var(--sl-spacing-small);
                    border-bottom: 1px solid var(--sl-input-border-color);
                    background: #080808;
                    text-transform: capitalize;
                }

                .skeleton-entries-container {
                    display: flex;
                    flex-direction: column;
                    gap: var(--sl-spacing-2x-small);
                }

                cm-skeleton-entry {
                    display: grid;
                    grid-template-columns: auto auto auto auto;
                    grid-gap: 5px;
                }

                .skeleton-entries-container sl-button {
                    align-self: start;
                }
            </style>`
        );
    }

    render() {
        super.render();
        for (const [category, entries] of Object.entries(this.data)) {
            const element = document.createElement('cm-skeleton-category');
            element.category = category;
            element.entries = entries;
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
