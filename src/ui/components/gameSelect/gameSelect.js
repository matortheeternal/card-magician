import { getGames } from '../../../domain/game/gameManager.js';
import { executeAction } from '../../systems/actionSystem.js';
import platform from '../../../shared/platformAdapter.js';

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
            quit: () => platform.terminateApp()
        });
    }

    get games() {
        return this._games ||= getGames();
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
            `<div class="no-content-prompt">${L`No games installed.`}</div>`
        );
    }

    renderGameOptions() {
        for (const game of this.games)
            this.renderGameOption(game);
        if (!this.games.length) {
            this.renderNoGames();
            return;
        }
        const firstItem = this.querySelector('.game-item');
        this.selectGame(firstItem);
    }

    renderActions() {
        return this.games?.length ? (
            `<sl-button variant="primary" data-click-action="start">
                ${L`Start`}
            </sl-button>`
        ) : (
            `<sl-button
                variant="primary"
                data-click-action="installPackage"
            >${L`Install Local Package`}</sl-button>
            <sl-button
                variant="danger"
                data-click-action="quit"
            >${L`Quit`}</sl-button>`
        );
    }

    render() {
        this.innerHTML = (
            `<div class="games-container"></div>
            <div class="buttons-container">${this.renderActions()}</div>`
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
