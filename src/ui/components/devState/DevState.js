import ReactiveComponent from '../ReactiveComponent.js';
import { hide, show } from '../../../shared/htmlUtils.js';
import {
    openProject,
    selectCard
} from '../../../domain/projects/projectManager.js';

export default class DevState extends ReactiveComponent {
    dirty = false;
    building = false;
    opened = null;

    connectedCallback() {
        this.render();
        this.bind();
    }

    bind() {
        this.handleEvents('click', {
            rebuild: () => this.onRebuildClick(),
            dismiss: () => this.onDismissClick()
        });
        this.ws = new WebSocket('ws://127.0.0.1:3344');
        this.opened = new Promise((resolve, reject) => {
            this.ws.addEventListener('open', resolve);
        });
        this.ws.addEventListener('message', event => this.onWebSocketMessage(event));
    }

    async requestData() {
        await this.opened;
        this.ws.send(JSON.stringify({'action': 'request data'}));
    }

    get primaryButton() {
        return this.querySelector('sl-button[variant="primary"]');
    }

    get dismissButton() {
        return this.querySelector('sl-button[data-click-action="dismiss"]');
    }

    get labelContainer() {
        return this.querySelector('.label');
    }

    get errorContainer() {
        return this.querySelector('.error');
    }

    updateError(error) {
        this.errorContainer?.remove();
        if (!error) return;

        const div = document.createElement('div');
        div.className = 'error';
        div.textContent = error;
        this.appendChild(div);
    }

    render() {
        if (!this.dirty) {
            hide(this);
            return;
        }
        this.innerHTML ||= (
            `<div class="label">Local changes detected</div>
            <sl-button variant="primary" data-click-action="rebuild">
                Rebuild
            </sl-button>
            <sl-button variant="danger" data-click-action="dismiss">
                Dismiss
            </sl-button>`
        );
        show(this);
    }

    async rebuild() {
        const cardIndex = window.selectedProjectCard
            ? activeProject.cards.indexOf(window.selectedProjectCard)
            : -1;
        const msg = {
            action: 'rebuild',
            project: activeProject.filePath,
            card: cardIndex
        };
        this.ws.send(JSON.stringify(msg));
    }

    startBuild() {
        this.updateError(null);
        this.labelContainer.textContent = 'Rebuilding...';
        this.primaryButton.loading = true;
        this.primaryButton.disabled = true;
        hide(this.dismissButton);
    }

    handleRebuildError(error) {
        log('state').error(error);
        this.labelContainer.textContent = 'Build error';
        this.updateError('Build failed. See terminal.');
        this.primaryButton.loading = false;
        this.primaryButton.disabled = false;
        this.primaryButton.variant = 'success';
        show(this.dismissButton);
        this.primaryButton.textContent = 'Retry';
    }

    async onWebSocketMessage(event) {
        const msg = JSON.parse(event.data);
        log('state').debug('received message', msg);
        this.dirty = msg.dirty;
        if (this.dirty) this.render();
        if (msg.lastError) this.handleRebuildError(msg.lastError);
        if (msg.reload) {
            window.suppressExit = true;
            location.reload();
        }
        if (msg.openProject) await openProject(msg.openProject);
        if (Number.isInteger(msg.selectCard))
            selectCard(activeProject.cards[msg.selectCard]);
    }

    async onRebuildClick() {
        if (this.building) return;
        this.startBuild();
        try {
            await this.rebuild();
        } catch (error) {
            this.handleRebuildError(error);
        }
    }

    async onDismissClick() {
        hide(this);
    }
}

customElements.define('dev-state', DevState);
