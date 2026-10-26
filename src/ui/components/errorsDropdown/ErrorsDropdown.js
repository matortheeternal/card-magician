import html from './ErrorsDropdown.html.js';
import { subscribe } from '../../../shared/reporting.js';
import { toggleDisplay } from '../../../shared/htmlUtils.js';

export default class ErrorsDropdown extends ReactiveComponent {
    connectedCallback() {
        this.render();
        this.bind();
    }

    bind() {
        this.handleEvents('click', {
            clear: () => {},
            copy: () => {},
            clearAll: () => {},
            copyAll: () => {},
        });
        subscribe(errorItem => {
            this.prependError(errorItem);
        });
    }

    get errorsContainer() {
        return this.querySelector('sl-tab-panel[name="errors"]');
    }

    get warningsContainer() {
        return this.querySelector('sl-tab-panel[name="warning"]');
    }

    toggleContentMessage(container) {
        const show = container.children.length === 1;
        const element = container.querySelector('.no-content-prompt');
        toggleDisplay(show, element);
    }

    prependError(errorItem) {
        const element = document.createElement('cm-error-item');
        element.model = errorItem;
        this.errorsContainer.prepend(element);
        this.toggleContentMessage(this.errorsContainer);
    }

    prependWarning(warningItem) {
        const element = document.createElement('cm-error-item');
        element.setAttribute('warning', '');
        element.model = warningItem;
        this.warningsContainer.prepend(element);
        this.toggleContentMessage(this.warningsContainer);
    }

    render() {
        this.innerHTML = html;
    }
}

customElements.define('cm-errors-dropdown', ErrorsDropdown);
