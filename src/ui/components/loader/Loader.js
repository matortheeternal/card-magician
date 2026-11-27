import ReactiveComponent from '../ReactiveComponent.js';
import { getLogMessages } from '../../../shared/log.js';
import { show } from '../../../shared/htmlUtils.js';
import safeStringify from '../../../shared/thePrinter.js';

export default class Loader extends ReactiveComponent {
    connectedCallback() {
        this.render();
        this.bind();
    }

    bind() {
        this.handleEvents('click', {
            copyLog: () => this.copyLog(),
            submitIssue: () => this.submitIssue(),
            joinDiscord: () => this.joinDiscord()
        });
    }

    get loadingMessage() {
        return this.querySelector('.loading-message');
    }

    get errorContainer() {
        return this.querySelector('.error-container');
    }

    get errorLog() {
        return this.querySelector('.error-log');
    }

    showError() {
        this.classList.add('error');
        this.errorLog.textContent = getLogMessages().map(msg => {
            return `[${msg.groupKey}] ${msg.message}`
                + msg.args.map(arg => '\n' + safeStringify(arg)).join('');
        }).join('\n');
        this.loadingMessage.textContent = 'Error loading.  :(';
        show(this.errorContainer);
    }

    render() {
        this.innerHTML = (
            `<div class="square-spinner"></div>
            <div class="loading-message">Loading...</div>
            <div class="error-container" style="display: none">
                <pre class="error-log"></pre>
                <div class="actions-container">
                    <button data-click-action="copyLog">
                        Copy to clipboard
                    </button>
                    <button data-click-action="submitIssue">
                        Submit issue to Codeberg
                    </button>
                    <button data-click-action="joinDiscord">
                        Join Discord for support
                    </button>
                </div>
            </div>`
        );
    }

    copyLog() {
        navigator.clipboard.writeText(this.errorLog.textContent);
    }

    async submitIssue() {
        await open('https://github.com/matortheeternal/card-magician/issues');
    }

    async joinDiscord() {
        await open('https://discord.com/invite/nj98EBpnNv');
    }
}

customElements.define('cm-loader', Loader);
