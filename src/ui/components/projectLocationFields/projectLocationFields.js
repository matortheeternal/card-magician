import platform from '../../../shared/platformAdapter.js';
import { getProjectsFolder } from '../../../domain/projects/newProjectLocation.js';

const L = localize('project-location-fields');

export default class ProjectLocationFields extends ReactiveComponent {
    connectedCallback() {
        this.render();
        this.bind();
        void this.loadDefaultFolder();
    }

    get nameInput() {
        return this.querySelector('sl-input[name="name"]');
    }

    get folderInput() {
        return this.querySelector('sl-input[name="folder"]');
    }

    get location() {
        return {
            name: this.nameInput.value.trim(),
            folder: this.folderInput.value.trim()
        };
    }

    get isComplete() {
        const { name, folder } = this.location;
        return Boolean(name && folder);
    }

    set projectName(value) {
        this.nameInput.value = value;
    }

    bind() {
        this.handleEvents('click', {
            browse: () => this.browse()
        });
        this.on('sl-input', () => this.emit('cm-project-location-change'));
        this.on('keydown', event => this.onKeyDown(event));
    }

    onKeyDown(event) {
        if (event.key !== 'Enter' || event.isComposing) return;
        event.preventDefault();
        this.emit('cm-project-location-submit');
    }

    async focusName() {
        await this.nameInput.updateComplete;
        this.nameInput.focus();
    }

    setFolder(folder) {
        this.folderInput.value = folder;
        this.emit('cm-project-location-change');
    }

    async loadDefaultFolder() {
        const folder = await getProjectsFolder();
        if (!this.folderInput.value) this.setFolder(folder);
    }

    async browse() {
        const folder = await platform.openFolderDialog(L`Choose a location`);
        if (folder) this.setFolder(folder);
    }

    render() {
        const folderHelp = L`A folder named after the project is created here.`;
        this.innerHTML = (
            `<sl-input name="name" label="${L`Project name`}"></sl-input>
            <sl-input name="folder" label="${L`Location`}" help-text="${folderHelp}">
                <sl-icon-button slot="suffix" name="folder2-open"
                    label="${L`Browse`}" data-click-action="browse">
                </sl-icon-button>
            </sl-input>`
        );
    }
}

customElements.define('cm-project-location-fields', ProjectLocationFields);
