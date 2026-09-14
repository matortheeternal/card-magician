import ReactiveComponent from '../ReactiveComponent.js';

export default class SettingsToc extends ReactiveComponent {
    connectedCallback() {
        this.render();
    }

    get settingsModal() {
        return this.closest('cm-settings-modal');
    }

    get pages() {
        const childTreeItems = [...this.settingsModal.activeNavItem.children];
        return childTreeItems.map(child => ({
            id: child.dataset.tabId,
            label: child.childNodes[0].textContent
        }));
    }

    render() {
        const pageItems = this.pages.map(page => (
            `<li>
                <a data-page-id="${page.id}" data-click-action="navigate">
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
