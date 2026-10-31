import './editFaceSymbol.css';

const L = localize('edit-face-symbol');

export default class EditFaceSymbol extends window.ReactiveComponent {
    #symbol = null;

    connectedCallback() {
        this.setAttribute('data-form-provider', '');
        this.render();
        this.bind();
    }

    bind() {
        this.handleEvents('click', {
            deleteSymbol: () => this.deleteSymbol()
        });
        this.addEventListener('cm-field-changed', () => {
            activeGame.faceSymbolManager.scheduleSave();
        });
    }

    set symbol(value) { this.#symbol = value; }
    get symbol() { return this.#symbol; }
    get model() { return this.#symbol; }

    get fields() {
        return [
            { id: 'name', label: L`Name` },
            { id: 'image', type: 'image', label: L`Image`, disableCrop: true },
        ];
    }

    render() {
        this.innerHTML = (
            `<div class="delete-item">
                <sl-icon name="x-lg" data-click-action="deleteSymbol"></sl-icon>
            </div>
            <form-field field-id="name"></form-field>
            <form-field field-id="image"></form-field>`
        );
    }

    async deleteSymbol() {
        const confirmed = await dialog.confirm(L`Delete ${this.symbol.name}?`);
        if (!confirmed) return;
        this.emit('delete-symbol', { symbol: this.symbol });
        this.remove();
    }
}

customElements.define('cm-edit-face-symbol', EditFaceSymbol);
