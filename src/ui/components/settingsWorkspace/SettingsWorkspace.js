import ReactiveComponent from '../ReactiveComponent.js';
import { onActiveProjectChanged } from '../../../domain/projects/projectManager.js';
import { getSettingsTabs } from '../../settings/settingsRegistry.js';
import { registerPendingSave } from '../../../lifecycle.js';

const report = createReporter({ unit: 'SettingsWorkspace' });

export default class SettingsWorkspace extends ReactiveComponent {
    #project;
    activeNavItem;

    constructor() {
        super();
        this.saveProject = this.saveProject.debounce(0);
    }

    connectedCallback() {
        this.render();
        this.bind();
        this.unregisterSave = registerPendingSave(this.saveProject);
        this.unsubscribeProject = onActiveProjectChanged(() => {
            if (this.closest('sl-tab-panel').active) this.activate();
        });
    }

    disconnectedCallback() {
        this.unsubscribeProject?.();
        this.unregisterSave?.();
        super.disconnectedCallback();
    }

    get workspaceTabs() {
        return this.closest('#workspace-tabs');
    }

    get contentContainer() {
        return this.querySelector('.content-container');
    }

    get navigation() {
        return this.querySelector('.navigation');
    }

    bind() {
        this.on('sl-selection-change', event => {
            if (event.target !== this.navigation.firstElementChild) return;
            this.selectNavItem(event.detail.selection[0]?.dataset.tabId);
        });
        this.on('project-changed', () => {
            this.saveProject(window.activeProject).catch(error => report('save', error));
        });
        this.handleEvents('click', {
            navigate: event => {
                event.preventDefault();
                this.selectNavItem(event.target.closest('[data-page-id]').dataset.pageId);
            }
        });
    }

    saveProject(project) {
        return project?.save();
    }

    open(section) {
        this.activate(section);
        this.workspaceTabs.show('settings');
    }

    activate(section) {
        if (this.#project !== window.activeProject || !this.activeNavItem) {
            this.#project = window.activeProject;
            this.activeNavItem = null;
            this.renderNav();
        }
        if (!section && this.activeNavItem) return;
        const saved = window.activeGame?.config.get('lastSettingsTab');
        this.selectNavItem(section ?? saved);
        if (this.activeNavItem) return;
        const first = this.navigation.querySelector('sl-tree-item');
        this.selectNavItem(first?.dataset.tabId);
    }

    selectNavItem(id) {
        if (!id) return;
        const itemSelector = `[data-tab-id="${CSS.escape(id)}"]`;
        const navItem = this.navigation.querySelector(itemSelector);
        if (!navItem || navItem === this.activeNavItem) return;
        this.activeNavItem?.removeAttribute('selected');
        this.activeNavItem = navItem;
        navItem.setAttribute('selected', '');
        let parent = navItem.parentElement;
        while (parent.tagName === 'SL-TREE-ITEM') {
            parent.expanded = true;
            parent = parent.parentElement;
        }
        this.contentContainer.replaceChildren(document.createElement(id));
        this.contentContainer.scrollTop = 0;
        window.activeGame?.config.set('lastSettingsTab', id);
    }

    renderNav() {
        const tree = document.createElement('sl-tree');
        const items = new Map();
        for (const tab of getSettingsTabs()) {
            const item = document.createElement('sl-tree-item');
            item.textContent = tab.label;
            item.dataset.tabId = tab.id;
            const parent = tab.parentId ? items.get(tab.parentId) : tree;
            parent.appendChild(item);
            items.set(tab.id, item);
        }
        this.navigation.replaceChildren(tree);
    }

    render() {
        this.innerHTML = `
            <nav class="navigation"></nav>
            <div class="content-container"></div>`;
    }
}

customElements.define('cm-settings-workspace', SettingsWorkspace);
