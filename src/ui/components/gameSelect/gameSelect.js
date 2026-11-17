import { getGames } from '../../../domain/game/gameManager.js';

const L = localize('game-select');

export default class GameSelect extends ReactiveComponent {
    connectedCallback() {
        this.render();
        this.bind();
    }

    bind() {
        this.handleEvents('click', {
            install: () => this.emit('cm-game-select-install')
        });
        this.on('sl-change', () => this.emit('cm-game-select-change', {
            gameId: this.selectedGameId
        }));
    }

    get games() {
        return this._games ||= getGames();
    }

    get select() {
        return this.querySelector('sl-select');
    }

    get selectedGameId() {
        return this.select.value || null;
    }

    get placeholder() {
        return this.games.length ? '' : L`No games installed.`;
    }

    renderGame(game) {
        return (
            `<sl-option value="${game.id}">
                ${L([game.name])}
                <small slot="suffix" class="text-muted">${game.version}</small>
            </sl-option>`
        );
    }

    render() {
        this.innerHTML = (
            `<sl-select label="${L`Game`}" placeholder="${this.placeholder}"
                value="${this.games[0]?.id ?? ''}" hoist>
                ${this.games.map(game => this.renderGame(game)).join('')}
            </sl-select>
            <sl-button data-click-action="install">
                <sl-icon slot="prefix" name="box-arrow-up"></sl-icon>
                ${L`Install game package`}
            </sl-button>`
        );
    }
}

customElements.define('cm-game-select', GameSelect);
