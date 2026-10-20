import Modal from '../Modal.js';
import { getSettingsTabs } from '../../settings/settingsRegistry.js';
import { registerModal } from '../modalManager.js';
import { getConfig } from '../../../domain/game/gameManager.js';

const L = localize('settings-modal');

export default class SettingsModal extends Modal {
    static id = 'cm-settings-modal';
    title = L`Settings`;

    #activeNavItem;
    #activeTab;

    constructor() {
        super();
        this.tabs = getSettingsTabs();
        this.saveProject = this.saveProject.debounce(500);
    }

    connectedCallback() {
        super.connectedCallback();
        this.renderNav();
        const defaultTabId = getConfig().get('lastSettingsTab') || this.tabs[0].id;
        this.selectNavItem(this.data?.selectedTabId || defaultTabId);
    }

    bind() {
        super.bind();
        this.addEventListener('sl-selection-change', event => {
            this.activeNavItem = event.detail.selection[0];
        });
        this.addEventListener('project-changed', () => {
            this.saveProject();
        });
    }

    get activeTab() {
        return this.#activeTab;
    }

    set activeTab(value) {
        this.#activeTab?.remove?.();
        this.#activeTab = value;
        if (this.isConnected)
            this.contentContainer.appendChild(value);
        getConfig().set('lastSettingsTab', value.tagName.toLowerCase());
    }

    get activeNavItem() {
        return this.#activeNavItem;
    }

    set activeNavItem(value) {
        this.#activeNavItem = value;
        this.activeTab = document.createElement(this.activeNavItem.dataset.tabId);
    }

    get onClickHandlers() {
        return {
            ...super.onClickHandlers,
            navigate: event => {
                const tabId = event.target.dataset.pageId;
                if (tabId) this.selectNavItem(tabId);
            },
            close: () => this.close()
        };
    }

    get contentContainer() {
        return this.querySelector('div.content-container');
    }

    get tabsContainer() {
        return this.querySelector('div.tabs-container');
    }

    selectNavItem(id) {
        const navItem = this.querySelector(`[data-tab-id=${id}]`);
        if (!navItem) return;
        navItem.setAttribute('selected', '');
        if (this.activeNavItem)
            this.activeNavItem.removeAttribute('selected');
        this.activeNavItem = navItem;
        let parent = navItem.parentElement;
        while (parent.tagName === 'SL-TREE-ITEM') {
            parent.expanded = true;
            parent = parent.parentElement;
        }
    }

    renderNav() {
        const tree = document.createElement('sl-tree');
        const itemsById = {};
        for (const tab of this.tabs) {
            const item = document.createElement('sl-tree-item');
            item.appendChild(document.createTextNode(tab.label));
            item.setAttribute('data-click-action', 'tabSelected');
            item.setAttribute('data-tab-id', tab.id);
            const parent = tab.parentId
                ? itemsById[tab.parentId]
                : tree;
            if (!parent)
                throw new Error(`Failed to resolve parent for tab ${tab.id}`);
            parent.appendChild(item);
            itemsById[tab.id] = item;
        }
        this.tabsContainer.replaceChildren(tree);
    }

    renderBody() {
        return (
            `<div class="two-columns">
                <div class="navigation">
                    <div class="search-bar"></div>
                    <div class="tabs-container"></div>
                </div>
                <div class="content-container"></div>
            </div>`
        );
    }

    renderActions() {
        return (
            `<sl-button data-click-action="close">Close</sl-button>`
        );
    }

    saveProject() {
        window.activeProject.save();
    }
}

registerModal(SettingsModal);
