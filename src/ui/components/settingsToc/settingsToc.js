import ReactiveComponent from '../ReactiveComponent.js';

export default class SettingsToc extends ReactiveComponent {
    connectedCallback() {
        this.render();
    }

    get settingsWorkspace() {
        return this.closest('cm-settings-workspace');
    }

    get pages() {
        const childTreeItems = [...this.settingsWorkspace.activeNavItem.children];
        return childTreeItems.map(child => ({
            id: child.dataset.tabId,
            label: child.childNodes[0].textContent
        }));
    }

    render() {
        const pageItems = this.pages.map(page => (
            `<li>
                <a href="#${page.id}" data-page-id="${page.id}"
                   data-click-action="navigate">
                    ${page.label}
                </a>
            </li>`
        ));

        this.innerHTML = (
            `<ul>
                ${pageItems.join('\n')}
            </ul>`
        );
    }
}

customElements.define('cm-settings-toc', SettingsToc);
