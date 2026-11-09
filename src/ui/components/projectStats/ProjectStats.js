import { executeAction } from '../../systems/actionSystem.js';
import './StatisticsCards.js';
import ReactiveComponent from '../ReactiveComponent.js';
import { onActiveProjectChanged } from '../../../domain/projects/projectManager.js';

const L = localize('project-statistics');
const report = createReporter({ unit: 'ProjectStats' });

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
    get workspaceTabs() { return document.querySelector('#workspace-tabs'); }
    get scrollRegion() { return this.querySelector('.stats-main'); }
    get page() { return this.querySelector('.stats-page'); }
    get scope() { return this.querySelector('.stats-scope'); }
    get summary() { return this.querySelector('.stats-summary'); }
    get emptyMessage() { return this.querySelector('.stats-empty'); }
    get cardsPanel() { return this.querySelector('cm-statistics-cards'); }
    get charts() { return this.querySelectorAll('cm-chart'); }

    connectedCallback() {
        this.render();
        this.bind();
    }

    render() {
        this.innerHTML = `
            <section class="stats-main" aria-label="${L`Project statistics`}">
                <header class="stats-header">
                    <div><h1>${L`Project statistics`}</h1>
                        <p class="stats-summary"></p></div>
                </header>
                <p class="stats-scope" hidden></p>
                <p class="stats-empty" hidden>
                    ${L`Add cards or open a project to see statistics.`}
                </p>
                <div class="stats-page"></div>
            </section>
            <cm-statistics-cards></cm-statistics-cards>`;
    }

    bind() {
        this.on('chart-selection', event => this.showSelection(event));
        this.on('card-activated', event => this.openCard(event));
        this.unsubscribeProject = onActiveProjectChanged(project => {
            this.observeProject(project);
        });
    }

    showSelection(event) {
        if (event.detail.project !== this.project) return;
        this.cardsPanel.showSelection(event.detail);
    }

    openCard(event) {
        if (event.target !== this.cardsPanel) return;
        const { card } = event.detail;
        if (!this.project.cards.includes(card)) return;
        this.workspaceTabs.show('cards');
        executeAction('reveal-card', card)
            .catch(error => report('openCard', error, [card]));
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
        this.watch('project-statistics', project, this.game.statistics.projectProperties,
                   () => this.refresh());
        this.refresh();
    }

    refresh() {
        this.cardsPanel.clear();
        const cards = this.project?.cards || [];
        this.context = {
            registry: this.game.statistics, project: this.project,
            records: cards.map(card => this.game.statistics.prepare(card, this.project))
        };
        this.summary.textContent = cardCountLabel(cards.length);
        this.emptyMessage.hidden = cards.length > 0;
        for (const chart of this.charts) chart.requestUpdate();
    }
}

customElements.define('cm-project-stats', ProjectStats);
