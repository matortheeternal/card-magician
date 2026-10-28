import { registerModal } from '../modalManager.js';
import { executeAction } from '../../systems/actionSystem.js';

const L = localize('build-filter-modal');

export default class buildFilterModal extends Modal {
    static id = 'cm-build-filter-modal';
    title = L`Build Filter`;
    queryParts = [];

    connectedCallback() {
        super.connectedCallback();
        this.renderGroups();
    }

    bind() {
        super.bind();
        this.addEventListener('cm-select-preset', event => {
            const queryParts = event.target.selected;
            const oldQueryParts = event.detail;
            for (const part of oldQueryParts)
                this.queryParts.remove(part);
            this.queryParts.push(...queryParts);
            this.updateFilterInput();
        });
    }

    get onClickHandlers() {
        return {
            ...super.onClickHandlers,
            filter: () => this.filter()
        };
    }

    get groupsContainer() {
        return this.querySelector('.groups-container');
    }

    get filterInput() {
        return this.querySelector('sl-input');
    }

    get filterQuery() {
        return this.filterInput.value;
    }

    updateFilterInput() {
        this.filterInput.value = this.queryParts.join(' ');
    }

    renderActions() {
        return (
            `<sl-button data-click-action="filter">${L`Filter`}</sl-button>
             <sl-button data-click-action="close">${L`Cancel`}</sl-button>`
        );
    }

    renderGroups() {
        for (const group of activeGame.filterPresets) {
            const el = document.createElement('cm-filter-group');
            el.model = group;
            this.groupsContainer.append(el);
        }
    }

    renderBody() {
        return (
            `<div class="input-container">
                <sl-input size="large"></sl-input>
            </div>
            <div class="groups-container"></div>`
        );
    }

    filter() {
        executeAction('filter', this.filterQuery);
        this.close();
    }
}

registerModal(buildFilterModal);
