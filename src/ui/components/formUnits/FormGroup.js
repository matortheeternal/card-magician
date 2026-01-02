import { emit, esc, escapeHTML, toggleDisplay } from '../../../shared/htmlUtils.js';
import ReactiveComponent from '../ReactiveComponent.js';
import FormToggle from './FormToggle.js';

export default class FormGroup extends ReactiveComponent {
    connectedCallback() {
        if (!this.showKey) return;
        this.render();
    }

    get provider() {
        return this._provider ??= this.closest('[data-form-provider]');
    }

    get modelKey() {
        return this._modelKey ??= this.getAttribute('model-key');
    }

    get model() {
        return this._model ??= (
            this.modelKey
                ? this.provider.model[this.modelKey]
                : this.provider.model
        );
    }

    get optional() {
        return this._optional ??= this.hasAttribute('optional');
    }

    get label() {
        return this._label ??= this.getAttribute('label');
    }

    get showKey() {
        return this._showKey ??= this.getAttribute('show');
    }

    get show() {
        return Boolean(this.model[this.showKey]);
    }

    get error() {
        return (
            (!this.provider && 'Could not find form provider in HTML ancestors.')
            || (!this.model && 'Could not resolve data model from form provider.')
        );
    }

    renderError() {
        const path = [this.modelKey, this.label].filter(Boolean).join('/');
        this.innerHTML = (
            `<sl-tooltip content="${esc(this.error)}" placement="bottom">
                <div class="error">Error rendering ${escapeHTML(path)}</div>
            </sl-tooltip>`
        );
    }

    updateDisplay(show) {
        for (const child of this.children) {
            if (child === this.toggle) continue;
            toggleDisplay(show, child);
        }
    }

    render() {
        if (this.error) return this.renderError();
        if (!this.optional) return this.updateDisplay(this.show);
        this.toggle = FormToggle.create(this, this.label);
        this.appendChild(this.toggle);
        this.watch('show', this.model, this.showKey, () => this.toggle.render());
    }

    toggleShow(show) {
        this.model[this.showKey] = show;
        changed(this.model, this.showKey);
        emit(this, 'cm-field-changed');
    }
}

customElements.define('form-group', FormGroup);
