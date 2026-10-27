import { emit } from '../../../shared/htmlUtils.js';

export default class ErrorItem extends ReactiveComponent {
    #model;

    connectedCallback() {
        this.render();
        this.bind();
    }

    bind() {
        this.handleEvents('click', {
            clear: () => this.clear(),
            copy: () => this.copy(),
        });
    }

    get model() {
        return this.#model;
    }

    set model(value) {
        this.#model = value;
    }

    render() {
        if (!this.model) return;
        const label = this.model.context.label || `unit ${this.model.context.unit}`;
        this.innerHTML = (
            `<div class="icon-container">
                 <sl-icon name="exclamation-circle"></sl-icon>
             </div>
             <div class="error-body">
                 <div>An error occurred in ${label}</div>
                 <div><code>${this.model.id}</code></div>
                 <div>${this.model.error.message}</div>
             </div>
             <div>
                 <sl-icon-button
                    name="clipboard"
                    data-click-action="copy"
                ></sl-icon-button>
                 <sl-icon-button
                    name="x-lg"
                    data-click-action="clear"
                ></sl-icon-button>
             </div>`
        );
    }

    clear() {
        emit(this, 'cm-error-clear');
    }

    copy() {
        // TODO
    }
}

customElements.define('cm-error-item', ErrorItem);
