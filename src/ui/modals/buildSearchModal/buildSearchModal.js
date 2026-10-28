import { registerModal } from '../modalManager.js';
import { executeAction } from '../../systems/actionSystem.js';

const L = localize('build-search-modal');

export default class BuildSearchModal extends Modal {
    static id = 'cm-build-search-modal';
    title = L`Build Search`;
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
            this.updateSearchInput();
        });
    }

    get onClickHandlers() {
        return {
            ...super.onClickHandlers,
            search: () => this.search()
        };
    }

    get groupsContainer() {
        return this.querySelector('.groups-container');
    }

    get searchInput() {
        return this.querySelector('sl-input');
    }

    get searchQuery() {
        return this.searchInput.value;
    }

    updateSearchInput() {
        this.searchInput.value = this.queryParts.join(' ');
    }

    renderActions() {
        return (
            `<sl-button data-click-action="search">${L`Search`}</sl-button>
             <sl-button data-click-action="close">${L`Cancel`}</sl-button>`
        );
    }

    renderGroups() {
        for (const group of activeGame.searchPresets) {
            const el = document.createElement('cm-search-group');
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

    search() {
        executeAction('search', this.searchQuery);
        this.close();
    }
}

registerModal(BuildSearchModal);
