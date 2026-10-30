import ReactiveComponent from '../ReactiveComponent.js';
import { toggleDisplay } from '../../../shared/htmlUtils.js';
import { getConfig } from '../../../domain/game/gameManager.js';
import { checkFileExists } from '../../../shared/fsUtils.js';
import { openProject } from '../../../domain/projects/projectManager.js';

const L = localize('recent-projects');

export default class RecentProjects extends ReactiveComponent {
    connectedCallback() {
        this.bind();
        this.render();
    }

    bind() {
        getConfig().onRecentFilesChanged(() => this.render());
    }

    get container() {
        return this.querySelector('.buttons-container');
    }

    async getRecentProjects() {
        const projects = [];
        for (const project of getConfig().recentFiles) {
            if (await checkFileExists(project))
                projects.push(project);
        }
        return projects;
    }

    renderRecentProject(project) {
        const button = document.createElement('sl-button');
        button.variant = 'text';
        button.size = 'small';
        button.classList.add('recent-project');
        button.addEventListener('click', () => openProject(project));
        button.textContent = String(project);
        this.container.appendChild(button);
    }

    async render() {
        const recentProjects = await this.getRecentProjects();
        toggleDisplay(recentProjects.length > 0, this);
        if (!recentProjects.length) return;

        this.innerHTML = (
            `<h3>${L`Recent projects`}</h3>
            <div class="buttons-container"></div>`
        );
        for (const project of recentProjects)
            this.renderRecentProject(project);
    }
}

customElements.define('cm-recent-projects', RecentProjects);
