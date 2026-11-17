import { getGames } from '../../../domain/game/gameManager.js';

const L = localize('game-select');

export default class GameSelect extends ReactiveComponent {
    connectedCallback() {
        this.render();
        this.bind();
    }

    bind() {
        this.handleEvents('click', {
            selectGame: event => this.selectGame(event.target.closest('.game-item')),
            install: () => this.emit('cm-game-select-install')
        });
    }

    get games() {
        return this._games ||= getGames();
    }

    get gameItems() {
        return this.querySelectorAll('.game-item[data-game-id]');
    }

    get selectedGameId() {
        return this.querySelector('.game-item.selected')?.dataset.gameId ?? null;
    }

    markSelected(item) {
        for (const gameItem of this.gameItems)
            gameItem.classList.toggle('selected', gameItem === item);
    }

    selectGame(item) {
        this.markSelected(item);
        this.emit('cm-game-select-change', { gameId: item.dataset.gameId });
    }

    renderGame(game) {
        return (
            `<div class="game-item" data-click-action="selectGame"
                data-game-id="${game.id}">
                <header>
                    <strong>${L([game.name])}</strong>
                    <sl-badge variant="primary">${game.version}</sl-badge>
                </header>
                <small class="text-muted">${L`maintained by ${game.author}`}</small>
            </div>`
        );
    }

    renderNoGames() {
        if (this.games.length) return '';
        return `<p class="text-muted">${L`No games installed.`}</p>`;
    }

    render() {
        this.innerHTML = (
            `${this.games.map(game => this.renderGame(game)).join('')}
            ${this.renderNoGames()}
            <div class="game-item install-item" data-click-action="install">
                <sl-icon name="box-arrow-up"></sl-icon>
                ${L`Install game package`}
            </div>`
        );
        this.markSelected(this.gameItems[0]);
    }
}

customElements.define('cm-game-select', GameSelect);
