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
            rebuild: () => this.onRebuildClick()
        });
        console.log('hello world');
        this.ws = new WebSocket('ws://127.0.0.1:3344');
        this.ws.addEventListener('message', event => this.onWebSocketMessage(event));
    }

    get button() {
        return this.querySelector('sl-button');
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
        this.innerHTML = (
            `<div class="label">Local changes detected</div>
            <sl-button variant="primary" data-click-action="rebuild">
                Rebuild
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
        this.button.loading = true;
        this.button.disabled = true;
    }

    handleRebuildError(error) {
        console.error(error);
        this.labelContainer.textContent = 'Build error';
        this.updateError('Build failed. See terminal.');
        this.button.loading = false;
        this.button.disabled = false;
        this.button.variant = 'success';
        this.button.textContent = 'Retry';
    }

    onWebSocketMessage(event) {
        console.log('received message', event.data);
        const msg = JSON.parse(event.data);
        if (!this.dirty && msg.dirty) {
            this.dirty = msg.dirty;
            this.render();
        }
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
}

customElements.define('dev-state', DevState);
