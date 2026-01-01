import { toggleDisplay } from '../../../shared/htmlUtils.js';
import FormUnit from './FormUnit.js';

export default class FieldGroup extends FormUnit {
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
        for (const child of this.childNodes) {
            if (child === this.toggle) continue;
            toggleDisplay(show, child);
        }
    }

    render() {
        if (this.error) return this.renderError();
        if (!this.optional) return;
        this.appendChild(this.generateToggleElement());
    }

    addUnit() {
        this.model[this.showKey] = true;
        changed(this.model, this.showKey);
    }

    removeUnit() {
        this.model[this.showKey] = false;
        changed(this.model, this.showKey);
    }
}

customElements.define('field-group', FieldGroup);
