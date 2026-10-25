import html from './ErrorsDropdown.html.js';
import { subscribe } from '../../../shared/reporting.js';

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

    prependError(errorItem) {

    }

    render() {
        this.innerHTML = html;
    }
}

customElements.define('cm-errors-dropdown', ErrorsDropdown);
