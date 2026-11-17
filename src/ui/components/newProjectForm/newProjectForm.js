const L = localize('new-project-form');

export default class NewProjectForm extends ReactiveComponent {
    connectedCallback() {
        this.render();
        this.bind();
        void this.locationFields.focusName();
    }

    get gameSelect() {
        return this.querySelector('cm-game-select');
    }

    get locationFields() {
        return this.querySelector('cm-project-location-fields');
    }

    get createButton() {
        return this.querySelector('[data-click-action="create"]');
    }

    get canCreate() {
        return Boolean(this.gameSelect.selectedGameId && this.locationFields.isComplete);
    }

    bind() {
        this.handleEvents('click', {
            cancel: () => this.emit('cm-new-project-cancel'),
            create: () => this.create()
        });
        this.on('cm-game-select-change', () => this.update());
        this.on('cm-project-location-change', () => this.update());
        this.on('cm-project-location-submit', () => this.create());
    }

    create() {
        if (!this.canCreate) return;
        this.emit('cm-new-project-create', {
            gameId: this.gameSelect.selectedGameId,
            ...this.locationFields.location
        });
    }

    update() {
        this.createButton.disabled = !this.canCreate;
    }

    render() {
        this.innerHTML = (
            `<header><h2>${L`New project`}</h2></header>
            <cm-game-select></cm-game-select>
            <cm-project-location-fields></cm-project-location-fields>
            <footer>
                <sl-button data-click-action="cancel">${L`Back`}</sl-button>
                <sl-button variant="primary" data-click-action="create" disabled>
                    ${L`Create`}
                </sl-button>
            </footer>`
        );
    }
}

customElements.define('cm-new-project-form', NewProjectForm);
