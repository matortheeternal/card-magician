import ReactiveComponent from '../ReactiveComponent.js';
import { hide, show } from '../../../shared/htmlUtils.js';

export default class DevState extends ReactiveComponent {
    dirty = false;
    building = false;
    pollInterval = null;

    connectedCallback() {
        this.render();
        this.bind();
        this.startPolling();
    }

    disconnectedCallback() {
        clearInterval(this.pollInterval);
    }

    bind() {
        this.handleEvents('click', {
            rebuild: () => this.onRebuildClick()
        });
    }

    async fetchDevState() {
        try {
            const res = await fetch('http://127.0.0.1:3344/__dev/state');
            const state = await res.json();
            if (state.dirty && !this.dirty) {
                this.dirty = true;
                this.render();
            }
        } catch {
            return null;
        }
    }

    startPolling() {
        this.pollInterval = setInterval(async () => {
            await this.fetchDevState();
        }, 1000);
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
        const res = await fetch('http://127.0.0.1:3344/__dev/rebuild', {
            method: 'POST'
        });
        if (!res.ok) throw new Error('Build failed');
        location.reload();
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
        this.button.loading = false
        this.button.disabled = false;
        this.button.variant = 'success';
        this.button.textContent = 'Retry';
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
