import { getGames } from '../../../domain/game/gameManager.js';
import { executeAction } from '../../systems/actionSystem.js';

const L = localize('game-select');

export default class GameSelect extends ReactiveComponent {
    connectedCallback() {
        this.render();
        this.bind();
    }

    bind() {
        this.handleEvents('click', {
            selectGame: event => this.selectGame(event.target),
            start: () => this.start(),
            installPackage: () => executeAction('install-package'),
            quit: () => window.close()
        });
    }

    get selectedGameId() {
        const selected = this.querySelector('.game-item.selected');
        return selected?.dataset.gameId;
    }

    get gamesContainer() {
        return this.querySelector('.games-container');
    }

    renderGameOption(game) {
        const element = document.createElement('div');
        element.className = 'game-item';
        element.setAttribute('data-click-action', 'selectGame');
        element.setAttribute('data-game-id', game.id);
        element.innerHTML = (
            `<header>
                <strong>${L([game.name])}</strong>
                <sl-badge variant="primary">${game.version}</sl-badge>
            </header>
            <small class="text-muted">${L`maintained by ${game.author}`}</small>`
        );
        this.gamesContainer.append(element);
    }

    renderNoGames() {
        this.gamesContainer.innerHTML = (
            `<div class="no-content-prompt">${L`No games installed`}</div>
            <div class="buttons-container">
                <sl-button
                    variant="primary"
                    data-click-action="installPackage"
                >${L`Install Local Package`}</sl-button>
                <sl-button
                    variant="danger"
                    data-click-action="quit"
                >${L`Quit`}</sl-button>
            </div>`
        );
    }

    renderGameOptions() {
        const games = getGames();
        for (const game of games)
            this.renderGameOption(game);
        if (!games.length) {
            this.renderNoGames();
            return;
        }
        const firstItem = this.querySelector('.game-item');
        this.selectGame(firstItem);
    }

    render() {
        this.innerHTML = (
            `<div class="games-container"></div>
            <div class="buttons-container">
                <sl-button variant="primary" data-click-action="start">
                    ${L`Start`}
                </sl-button>
            </div>`
        );
        this.renderGameOptions();
    }

    deselectGames() {
        const gameItems = this.querySelectorAll('.game-item');
        for (const gameItem of gameItems)
            gameItem.classList.remove('selected');
    }

    selectGame(element) {
        this.deselectGames();
        const item = element.closest('.game-item');
        item.classList.toggle('selected', true);
    }

    start() {
        const gameId = this.selectedGameId;
        if (!gameId) throw new Error('No game selected');
        this.emit('cm-select-game', { gameId });
    }
}

customElements.define('cm-game-select', GameSelect);
