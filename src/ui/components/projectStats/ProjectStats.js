import ReactiveComponent from '../ReactiveComponent.js';
import { onActiveProjectChanged } from '../../../domain/projects/projectManager.js';

const L = localize('project-statistics');

function cardCountLabel(count) {
    if (count === 1) return L`${count} card`;
    return L`${count} cards`;
}

function createGamePage(game) {
    if (game?.statisticsComponent)
        return document.createElement(game.statisticsComponent);
    const message = document.createElement('p');
    message.textContent = L`This game does not provide statistics yet.`;
    return message;
}

export default class ProjectStats extends ReactiveComponent {
    get page() { return this.querySelector('.stats-page'); }
    get scope() { return this.querySelector('.stats-scope'); }
    get summary() { return this.querySelector('.stats-summary'); }
    get emptyMessage() { return this.querySelector('.stats-empty'); }
    get charts() { return this.querySelectorAll('cm-chart'); }

    connectedCallback() {
        this.render();
        this.bind();
    }

    render() {
        this.innerHTML = `
            <header class="stats-header">
                <div><h1>${L`Project statistics`}</h1>
                    <p class="stats-summary"></p></div>
            </header>
            <p class="stats-scope" hidden></p>
            <p class="stats-empty" hidden>
                ${L`Add cards or open a project to see statistics.`}
            </p>
            <div class="stats-page"></div>`;
    }

    bind() {
        this.unsubscribeProject = onActiveProjectChanged(project => {
            this.observeProject(project);
        });
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.unsubscribeProject?.();
    }

    updateGame(game) {
        if (this.game === game) return;
        this.game = game;
        this.page.replaceChildren(createGamePage(game));
        this.scope.textContent = this.page.firstElementChild?.countingPolicy || '';
        this.scope.hidden = !this.scope.textContent;
    }

    observeProject(project) {
        this.project = project;
        this.updateGame(window.activeGame);
        this.watch('project-cards', project, 'cards', () => this.refresh());
        this.refresh();
    }

    refresh() {
        const cards = this.project?.cards || [];
        this.context = {
            registry: this.game.statistics, project: this.project,
            records: cards.map(card => this.game.statistics.prepare(card))
        };
        this.summary.textContent = cardCountLabel(cards.length);
        this.emptyMessage.hidden = cards.length > 0;
        for (const chart of this.charts) chart.requestUpdate();
    }
}

customElements.define('cm-project-stats', ProjectStats);
