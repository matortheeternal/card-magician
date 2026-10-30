import './faceSymbolSettings.css';
import '../editFaceSymbol/editFaceSymbol.js';

const L = localize('game-magic');

export default class FaceSymbolSettings extends CardMagicianSettings {
    static id = 'cm-face-symbol-settings';
    static parentId = 'cm-magic-settings';
    static label = L`Custom Face Symbols`;
    static groupWeight = 0;

    static search() {
        return [];
    }

    bind() {
        this.handleEvents('click', {
            addSymbol: () => this.addSymbol()
        });
        this.addEventListener('delete-symbol', event => {
            this.manager.remove(event.detail.symbol);
            this.manager.scheduleSave();
        });
    }

    get manager() {
        return activeGame.faceSymbolManager;
    }

    get model() {
        return this.manager.collection;
    }

    get itemsContainer() {
        return this.querySelector('.items-container');
    }

    renderSymbol(faceSymbol) {
        const element = document.createElement('cm-edit-face-symbol');
        element.symbol = faceSymbol;
        this.itemsContainer.appendChild(element);
    }

    renderSymbols() {
        for (const symbol of this.model)
            this.renderSymbol(symbol);
    }

    render() {
        this.innerHTML = (
            `<div class="header">
                <p class="text-muted">
                    ${L`Create and manage custom face symbols.`}
                </p>
                <sl-button data-click-action="addSymbol" variant="primary">
                    <sl-icon slot="prefix" name="plus-lg"></sl-icon>
                    ${L`Add Face Symbol`}
                </sl-button>
            </div>
            <div class="items-container"></div>`
        );
        this.renderSymbols();
    }

    addSymbol() {
        const symbol = this.manager.create();
        this.renderSymbol(symbol);
        this.manager.scheduleSave();
    }
}
