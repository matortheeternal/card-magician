import { executeAction } from '../../systems/actionSystem.js';
import { chooseProjectFile } from '../../../domain/projects/projectManager.js';
import {
    reserveNewProjectLocation
} from '../../../domain/projects/newProjectLocation.js';
import { getStartTabs } from './startTabs.js';

export default class StartScreen extends ReactiveComponent {
    connectedCallback() {
        this.render();
        this.bind();
        this.nav.selectTab('projects');
    }

    get nav() {
        return this.querySelector('cm-start-nav');
    }

    get content() {
        return this.querySelector(':scope > section');
    }

    bind() {
        this.on('cm-start-nav-select', event => this.showTab(event.detail.tabId));
        this.on('cm-project-select-new', () => this.showView('cm-new-project-form'));
        this.on('cm-project-select-browse', () => this.openProject());
        this.on('cm-project-select-open', event => {
            void executeAction('start-project', event.detail.filePath);
        });
        this.on('cm-game-select-install', () => executeAction('install-package'));
        this.on('cm-new-project-cancel', () => this.nav.selectTab('projects'));
        this.on('cm-new-project-create', event => this.createProject(event.detail));
    }

    showTab(tabId) {
        const tab = getStartTabs().find(startTab => startTab.id === tabId);
        this.showView(tab.tagName);
    }

    showView(tagName) {
        this.content.replaceChildren(document.createElement(tagName));
    }

    async createProject({ gameId, name, folder }) {
        const filePath = await reserveNewProjectLocation({ name, folder });
        if (!filePath) return;
        await executeAction('start-new-project', gameId, filePath);
    }

    async openProject() {
        const filePath = await chooseProjectFile();
        if (!filePath) return;
        await executeAction('start-project', filePath);
    }

    render() {
        this.innerHTML = (
            `<aside>
                <header>
                    <img src="/icons/appIcon.png" alt="">
                    <strong>Card Magician</strong>
                    <small class="text-muted">${appEnvironment.version}</small>
                </header>
                <cm-start-nav></cm-start-nav>
            </aside>
            <section></section>`
        );
    }
}

customElements.define('cm-start-screen', StartScreen);
