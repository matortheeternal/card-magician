import { emit, toggleDisplay } from '../../../shared/htmlUtils.js';
import FormUnit from './FormUnit.js';

export default class FormGroup extends FormUnit {
    connectedCallback() {
        if (!this.showKey) return;
        super.connectedCallback();
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

    updateDisplay(show) {
        for (const child of this.children) {
            if (child === this.toggle) continue;
            toggleDisplay(show, child);
        }
    }

    render() {
        if (this.error) return this.renderError();
        if (!this.optional) return this.updateDisplay(this.show);
        this.appendChild(this.generateToggleElement());
    }

    addUnit() {
        this.model[this.showKey] = true;
        changed(this.model, this.showKey);
        emit(this, 'cm-field-changed');
    }

    removeUnit() {
        this.model[this.showKey] = false;
        changed(this.model, this.showKey);
        emit(this, 'cm-field-changed');
    }
}

customElements.define('form-group', FormGroup);
