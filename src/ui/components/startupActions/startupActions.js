import { openModal } from '../../modals/modalManager.js';
import platform from '../../../shared/platformAdapter.js';
import { installPackage } from '../../../domain/extensions/extensionManager.js';

const L = localize('startup-actions');

export default class StartupActions extends ReactiveComponent {
    connectedCallback() {
        this.render();
        this.bind();
    }

    bind() {
        this.handleEvents('click', {
            installPackage: () => this.installPackage(),
            openSettings: () => openModal('cm-settings-modal')
        });
    }

    render() {
        this.innerHTML = (
            `<sl-button variant="text" size="large" data-click-action="installPackage">
                <sl-icon name="box-arrow-up" slot="prefix"></sl-icon>
                ${L`Install local package`}
            </sl-button>
            <sl-button variant="text" size="large" data-click-action="openSettings">
                <sl-icon name="gear" slot="prefix"></sl-icon>
                ${L`Settings`}
            </sl-button>`
        );
    }

    async installPackage() {
        const filePath = await platform.openSingleFileDialog(
            L`Select a package to install`, this.installFilters
        );
        if (!filePath) return;
        log('fs').info('Installing package:', filePath);
        void installPackage(filePath);
    }
}

customElements.define('cm-startup-actions', StartupActions);
