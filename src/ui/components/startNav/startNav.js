import { getStartTabs } from '../startScreen/startTabs.js';

const L = localize('start-nav');

export default class StartNav extends ReactiveComponent {
    connectedCallback() {
        this.render();
        this.bind();
    }

    get tabButtons() {
        return this.querySelectorAll('button[data-tab-id]');
    }

    bind() {
        this.handleEvents('click', {
            selectTab: event => {
                this.selectTab(event.target.closest('[data-tab-id]').dataset.tabId);
            }
        });
    }

    markSelected(tabId) {
        for (const button of this.tabButtons)
            button.setAttribute('aria-current', String(button.dataset.tabId === tabId));
    }

    selectTab(tabId) {
        this.markSelected(tabId);
        this.emit('cm-start-nav-select', { tabId });
    }

    renderTab(tab) {
        return (
            `<button type="button" class="plain-button" data-click-action="selectTab"
                data-tab-id="${tab.id}">${tab.label}</button>`
        );
    }

    render() {
        const tabs = getStartTabs().map(tab => this.renderTab(tab));
        this.innerHTML = `<nav aria-label="${L`Start`}">${tabs.join('')}</nav>`;
    }
}

customElements.define('cm-start-nav', StartNav);
