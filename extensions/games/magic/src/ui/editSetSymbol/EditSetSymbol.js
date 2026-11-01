import { renderSetSymbol } from '../../domain/setSymbol/renderSetSymbol.js';

const L = localize('magic');

export default class EditSetSymbol extends ReactiveComponent {
    connectedCallback() {
        this.render();
        this.bind();
    }

    bind() {
        this.handleEvents('click', {
            edit: () => activeProject.editSetSymbol(),
            setupSIE: () => this.closest('cm-settings-modal')
                ?.selectNavItem('cm-set-icon-editor-settings')
        });
        this.watch('symbol', activeProject, 'symbol', () => this.renderSymbols());
    }

    get rarities() {
        return ['common', 'uncommon', 'rare', 'mythic', 'special'];
    }

    get symbolsContainer() {
        return this.querySelector('.symbols-container');
    }

    renderSymbols() {
        this.symbolsContainer.replaceChildren();
        for (const rarity of this.rarities) {
            const element = document.createElement('div');
            element.innerHTML = renderSetSymbol(activeProject.symbol, rarity);
            element.title = rarity;
            this.symbolsContainer.append(element);
        }
    }

    render() {
        this.innerHTML = (
            `<label>${L`Set Symbol`}</label>
            <div class="symbols-container"></div>
            <div class="actions">
                <sl-button size="small" data-click-action="edit" variant="primary">
                    ${L`Edit`}
                </sl-button>
                ${activeGame.appConfig.get('setIconEditorPath', '') ? '' : `
                <sl-button size="small" data-click-action="setupSIE">
                    ${L`Use Set Icon Editor`}
                </sl-button>`}
            </div>`
        );
        this.renderSymbols();
    }
}

customElements.define('cm-edit-set-symbol', EditSetSymbol);
