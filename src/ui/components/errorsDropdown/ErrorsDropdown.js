import html from './ErrorsDropdown.html.js';
import { subscribe } from '../../../shared/reporting.js';
import { toggleDisplay } from '../../../shared/htmlUtils.js';
import ErrorReport from '../../../shared/ErrorReport.js';

export default class ErrorsDropdown extends ReactiveComponent {
    connectedCallback() {
        this.render();
        this.bind();
    }

    bind() {
        this.handleEvents('click', {
            clearAll: () => this.clearAll(),
            copyAll: () => this.copyAll(),
        });
        this.addEventListener('cm-error-clear', event => {
            event.target.remove();
            this.toggleContentMessage(this.errorsContainer);
            this.toggleContentMessage(this.warningsContainer);
            this.updateTrigger();
        });
        subscribe(errorItem => {
            this.prependError(errorItem);
            this.updateTrigger();
        });
    }

    get triggerButton() {
        return this.querySelector('sl-button[slot="trigger"]');
    }

    get errorsContainer() {
        return this.querySelector('sl-tab-panel[name="errors"]');
    }

    get warningsContainer() {
        return this.querySelector('sl-tab-panel[name="warnings"]');
    }

    get errorCount() {
        const errorItems = this.errorsContainer.querySelectorAll('cm-error-item');
        return errorItems.length;
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

    getTriggerText(errorCount) {
        if (errorCount === 0) return 'No issues';
        return `${errorCount} issue${errorCount > 1 ? 's' : ''}`;
    }

    updateTrigger() {
        const iconNode = this.triggerButton.firstElementChild;
        const textNode = this.triggerButton.lastChild;
        const errorCount = this.errorCount;
        const iconName = errorCount > 0 ? 'exclamation-circle' : 'check-circle';
        iconNode.setAttribute('name', iconName);
        textNode.textContent = this.getTriggerText(errorCount);
    }

    render() {
        this.innerHTML = html;
    }

    clearAll() {
        const activePanel = [...this.querySelectorAll('sl-tab-panel')]
            .find(panel => panel.active);
        if (!activePanel) throw new Error('Could not resolve active panel.');
        const items = activePanel.querySelectorAll('cm-error-item');
        for (const item of items) item.clear();
    }

    copyAll() {
        const errors = [...this.querySelectorAll('cm-error-item')]
            .map(item => item.model)
            .filter(Boolean);
        navigator.clipboard.writeText(new ErrorReport(errors).toMarkdown());
    }
}

customElements.define('cm-errors-dropdown', ErrorsDropdown);
