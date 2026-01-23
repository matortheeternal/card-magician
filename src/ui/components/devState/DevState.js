import ReactiveComponent from '../ReactiveComponent.js';
import { hide, show } from '../../../shared/htmlUtils.js';

export default class DevState extends ReactiveComponent {
    dirty = false;
    building = false;

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
        this.ws.addEventListener('message', event => this.onWebSocketMessage(event));
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
        this.ws.send('rebuild');
    }

    startBuild() {
        this.updateError(null);
        this.labelContainer.textContent = 'Rebuilding...';
        this.primaryButton.loading = true;
        this.primaryButton.disabled = true;
        hide(this.dismissButton);
    }

    handleRebuildError(error) {
        console.error(error);
        this.labelContainer.textContent = 'Build error';
        this.updateError('Build failed. See terminal.');
        this.primaryButton.loading = false;
        this.primaryButton.disabled = false;
        this.primaryButton.variant = 'success';
        show(this.dismissButton);
        this.primaryButton.textContent = 'Retry';
    }

    onWebSocketMessage(event) {
        const msg = JSON.parse(event.data);
        console.log('received message', msg);
        this.dirty = msg.dirty;
        if (this.dirty) this.render();
        if (msg.lastError) this.handleRebuildError(msg.lastError);
        if (msg.reload) location.reload();
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
