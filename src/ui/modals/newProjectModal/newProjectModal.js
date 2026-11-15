import { registerModal } from '../modalManager.js';
import {
    reserveNewProjectLocation
} from '../../../domain/projects/newProjectLocation.js';

const L = localize('new-project-modal');

export default class NewProjectModal extends Modal {
    static id = 'cm-new-project-modal';

    connectedCallback() {
        this.title = this.data.title ?? L`New project`;
        super.connectedCallback();
        this.locationFields.projectName = this.data.name ?? '';
        void this.locationFields.focusName();
    }

    get locationFields() {
        return this.querySelector('cm-project-location-fields');
    }

    get createButton() {
        return this.querySelector('[data-click-action="create"]');
    }

    get onClickHandlers() {
        return {
            ...super.onClickHandlers,
            create: () => this.create()
        };
    }

    bind() {
        super.bind();
        this.on('cm-project-location-change', () => this.update());
        this.on('cm-project-location-submit', () => this.create());
    }

    update() {
        this.createButton.disabled = !this.locationFields.isComplete;
    }

    async create() {
        if (!this.locationFields.isComplete) return;
        const filePath = await reserveNewProjectLocation(this.locationFields.location);
        if (!filePath) return;
        this.close();
        await this.data.callback(filePath);
    }

    renderBody() {
        return '<cm-project-location-fields></cm-project-location-fields>';
    }

    renderActions() {
        const confirmLabel = this.data.confirmLabel ?? L`Create`;
        return (
            `<sl-button variant="primary" data-click-action="create" disabled>
                ${confirmLabel}
            </sl-button>
            <sl-button data-click-action="close">${L`Cancel`}</sl-button>`
        );
    }
}

registerModal(NewProjectModal);
