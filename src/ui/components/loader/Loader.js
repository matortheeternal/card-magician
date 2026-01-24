import ReactiveComponent from '../ReactiveComponent.js';
import { getLogMessages } from '../../../shared/log.js';
import { show } from '../../../shared/htmlUtils.js';

export default class Loader extends ReactiveComponent {
    get errorLog() {
        return this.querySelector('.error-log');
    }

    showError() {
        this.classList.add('error');
        this.errorLog.textContent = getLogMessages();
        show(this.errorLog);
    }

    render() {
        this.innerHTML = (
            `<div class="spinner-container">
                <div class="square-spinner"></div>
                <div class="loading-message">Loading...</div>
                <pre class="error-log" style="display: none"></pre>
            </div>`
        );
    }
}

customElements.define('cm-loader', Loader);
