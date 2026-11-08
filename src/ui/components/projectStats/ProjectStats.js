import ReactiveComponent from '../ReactiveComponent.js';
import { onActiveProjectChanged } from '../../../domain/projects/projectManager.js';

const L = localize('project-statistics');

/** Project lifecycle only. The game supplies the page and chart definitions. */
export default class ProjectStats extends ReactiveComponent {
    connectedCallback() {
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
        this.unsubscribeProject = onActiveProjectChanged(project => {
            this.observeProject(project);
        });
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.unsubscribeProject?.();
    }

    observeProject(project) {
        const game = window.activeGame;
        if (this.game !== game) {
            this.game = game;
            const page = this.querySelector('.stats-page');
            page.replaceChildren();
            if (game?.statisticsComponent)
                page.appendChild(document.createElement(game.statisticsComponent));
            else page.textContent = L`This game does not provide statistics yet.`;
            const scope = this.querySelector('.stats-scope');
            scope.textContent = page.firstElementChild?.countingPolicy || '';
            scope.hidden = !scope.textContent;
        }
        const refresh = () => {
            const cards = project?.cards || [];
            this.context = {
                registry: game.statistics, project,
                records: cards.map(card => game.statistics.prepare(card))
            };
            this.querySelector('.stats-summary').textContent = `${cards.length} cards`;
            this.querySelector('.stats-empty').hidden = cards.length > 0;
            for (const chart of this.querySelectorAll('cm-chart')) chart.requestUpdate();
        };
        this.watch('project-cards', project, 'cards', refresh);
        refresh();
    }
}

customElements.define('cm-project-stats', ProjectStats);
