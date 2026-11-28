import { readRecentProjects } from '../../../domain/game/appConfig.js';
import { getGames } from '../../../domain/game/gameManager.js';

const L = localize('project-select');
const PATH_SEPARATOR_PATTERN = /[\/\\]/;
const PROJECT_EXTENSION_PATTERN = /\.cmproj$/i;

function describeProject({ filePath, title, openedAt = 0 }, game) {
    const filename = filePath.split(PATH_SEPARATOR_PATTERN).pop();
    return {
        filePath,
        openedAt,
        gameName: L([game.name]),
        icon: game.icon ? game.directory.url(game.icon) : null,
        name: title || filename.replace(PROJECT_EXTENSION_PATTERN, ''),
        location: filePath.slice(0, -filename.length - 1)
    };
}

async function readGameProjects(game) {
    const projects = await readRecentProjects(game.id);
    return projects.map(project => describeProject(project, game));
}

function byMostRecentlyOpened(a, b) {
    return b.openedAt - a.openedAt;
}

function matchesSearch(project, searchText) {
    const fields = [project.name, project.location, project.gameName];
    return fields.some(field => field.toLowerCase().includes(searchText));
}

export default class ProjectSelect extends ReactiveComponent {
    #projects = [];

    connectedCallback() {
        this.render();
        this.bind();
        void this.loadProjects();
    }

    get projectList() {
        return this.querySelector('ul');
    }

    get emptyState() {
        return this.querySelector(':scope > p');
    }

    get searchInput() {
        return this.querySelector('sl-input');
    }

    get searchText() {
        return this.searchInput.value.trim().toLowerCase();
    }

    get visibleProjects() {
        const { searchText } = this;
        return this.#projects.filter(project => matchesSearch(project, searchText));
    }

    get emptyMessage() {
        return this.#projects.length
            ? L`No projects match your search.`
            : L`No recent projects yet.`;
    }

    bind() {
        this.handleEvents('click', {
            newProject: () => this.emit('cm-project-select-new'),
            openProject: () => this.emit('cm-project-select-browse'),
            openRecent: event => this.openRecent(event.target)
        });
        this.on('sl-select', event => {
            if (event.detail.item.value === 'mse') this.emit('cm-project-select-import');
        });
        this.on('sl-input', () => this.renderProjects());
    }

    openRecent(target) {
        const { filePath } = target.closest('[data-file-path]').dataset;
        this.emit('cm-project-select-open', { filePath });
    }

    async readProjects() {
        const gameProjects = await Promise.all(getGames().map(readGameProjects));
        return gameProjects.flat().sort(byMostRecentlyOpened);
    }

    async loadProjects() {
        this.#projects = await this.readProjects();
        this.renderProjects();
    }

    createText(tagName, text) {
        const element = document.createElement(tagName);
        element.textContent = text;
        return element;
    }

    createImageIcon(url) {
        return Object.assign(document.createElement('img'), { src: url, alt: '' });
    }

    createFallbackIcon() {
        return Object.assign(document.createElement('sl-icon'), { name: 'collection' });
    }

    createIcon(url) {
        return url ? this.createImageIcon(url) : this.createFallbackIcon();
    }

    renderProject(project) {
        const item = document.createElement('li');
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'plain-button';
        button.dataset.clickAction = 'openRecent';
        button.dataset.filePath = project.filePath;
        button.append(
            this.createIcon(project.icon),
            this.createText('strong', project.name),
            this.createText('small', project.gameName),
            this.createText('small', project.location)
        );
        item.append(button);
        return item;
    }

    renderProjects() {
        const projects = this.visibleProjects;
        this.projectList.replaceChildren(...projects.map(project => {
            return this.renderProject(project);
        }));
        this.emptyState.textContent = this.emptyMessage;
        this.emptyState.hidden = projects.length > 0;
    }

    render() {
        this.innerHTML = (
            `<header>
                <sl-input type="search" size="small" clearable
                    placeholder="${L`Search projects`}"
                    aria-label="${L`Search projects`}">
                    <sl-icon slot="prefix" name="search"></sl-icon>
                </sl-input>
                <sl-button size="small" variant="primary" data-click-action="newProject">
                    ${L`New`}
                </sl-button>
                <sl-button size="small" data-click-action="openProject">
                    ${L`Open`}
                </sl-button>
                <sl-dropdown placement="bottom-end">
                    <sl-button size="small" slot="trigger" caret>${L`Import`}</sl-button>
                    <sl-menu>
                        <sl-menu-item value="mse">${L`From MSE`}</sl-menu-item>
                    </sl-menu>
                </sl-dropdown>
            </header>
            <p class="text-muted" hidden></p>
            <ul aria-label="${L`Recent projects`}"></ul>`
        );
    }
}

customElements.define('cm-project-select', ProjectSelect);
