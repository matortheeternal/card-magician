import ReactiveComponent from '../ReactiveComponent.js';
import { toggleDisplay } from '../../../shared/htmlUtils.js';
import { openProject } from '../../../domain/projects/projectManager.js';

const L = localize('recent-projects');

export default class RecentProjects extends ReactiveComponent {
    connectedCallback() {
        this.bind();
        this.render();
    }

    bind() {
        activeGame.config.onRecentProjectsChanged(() => this.render());
    }

    get container() {
        return this.querySelector('.buttons-container');
    }

    renderRecentProject(project) {
        const button = document.createElement('sl-button');
        button.variant = 'text';
        button.size = 'small';
        button.classList.add('recent-project');
        button.addEventListener('click', () => openProject(project.filePath));
        const filename = project.filePath.split(/[\/\\]/).pop();
        button.textContent = String(project.title || filename);
        this.container.appendChild(button);
    }

    async render() {
        const recentProjects = activeGame.config.recentProjects;
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
