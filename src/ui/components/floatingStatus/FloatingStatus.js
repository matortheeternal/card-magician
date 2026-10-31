import { registerAction } from '../../systems/actionSystem.js';
import { esc, escapeHTML, hide, show } from '../../../shared/htmlUtils.js';

const states = {
    changes: {
        icon: 'circle-fill',
        message: 'Unsaved changes'
    },
    saving: {
        icon: 'spinner',
        message: 'Saving...'
    },
    saved: {
        icon: 'check-circle',
        message: 'Saved',
        complete: true
    },
    failed: {
        icon: 'exclamation-circle',
        message: 'Save failed'
    }
};

export default class FloatingStatus extends ReactiveComponent {
    connectedCallback() {
        this.render = this.render.debounce(100);
        this.render();
        this.bind();
    }

    bind() {
        registerAction('set-status', stateId => {
            this.state = states[stateId];
            show(this);
            this.render();
        });
    }

    render() {
        if (this.timeout) clearTimeout(this.timeout);
        if (!this.state) return hide(this);
        this.classList.remove('hidden');
        this.innerHTML = [
            (this.state.icon === 'spinner'
                ? `<sl-spinner></sl-spinner>`
                : `<sl-icon name="${esc(this.state.icon)}"></sl-icon>`),
            `<span>${escapeHTML(this.state.message)}</span>`
        ].join('\n');
        if (this.state.complete)
            this.timeout = setTimeout(() => this.classList.add('hidden'), 4000);
    }
}

customElements.define('cm-floating-status', FloatingStatus);
