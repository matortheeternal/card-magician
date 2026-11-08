const L = localize('dialogs');

/**
 * @typedef {object} DialogOptions
 * @property {string} [title] - Dialog heading.
 * @property {string} confirmLabel - Label for the primary action.
 * @property {string} [cancelLabel] - Label for the cancel action.
 * @property {string} [defaultValue] - Initial prompt value.
 */

/**
 * @typedef {undefined | boolean | string | null} DialogResult
 */

export default class Dialog {
    confirmed = false;

    /**
     * @param {string} message - Plain text message or prompt label.
     * @param {Partial<DialogOptions>} [options={}] - Overrides for dialog defaults.
     */
    constructor(message, options = {}) {
        this.message = message;
        this.options = { ...this.defaultOptions, ...options };
    }

    /**
     * @returns {DialogOptions} Default labels and settings for this dialog type.
     */
    get defaultOptions() {
        return { confirmLabel: L`OK` };
    }

    /**
     * @returns {DialogResult} Dismissal value, specialized by subclasses.
     */
    get result() {
        return undefined;
    }

    /**
     * @returns {HTMLElement} Control that receives focus when the dialog opens.
     */
    get autofocusTarget() {
        return this.acceptButton;
    }

    /**
     * @returns {HTMLDivElement} Message content rendered as plain text.
     */
    createMessage() {
        const content = document.createElement('div');
        content.className = 'dialog-message';
        content.textContent = this.message;
        return content;
    }

    /**
     * @returns {HTMLElement} Main dialog content, specialized by subclasses.
     */
    createContent() {
        return this.createMessage();
    }

    /**
     * @param {string} label - Visible button text.
     * @param {(event: MouseEvent) => void} onClick - Action invoked on click.
     * @param {SlButton['variant']} [variant='default'] - Shoelace button variant.
     * @returns {SlButton} Footer action button.
     */
    createButton(label, onClick, variant = 'default') {
        const button = document.createElement('sl-button');
        button.slot = 'footer';
        button.textContent = label;
        button.variant = variant;
        button.addEventListener('click', onClick);
        return button;
    }

    /**
     * @returns {SlButton[]} Footer buttons in display order.
     */
    createActions() {
        this.acceptButton = this.createButton(
            this.options.confirmLabel, () => this.accept(), 'primary'
        );
        return [this.acceptButton];
    }

    /**
     * @returns {void} Records acceptance and starts closing the dialog.
     */
    accept() {
        this.confirmed = true;
        this.element.hide();
    }

    /**
     * @param {SlRequestCloseEvent} event - Shoelace dismissal request.
     * @returns {void}
     */
    onRequestClose(event) {
        if (event.detail.source === 'overlay') event.preventDefault();
    }

    /**
     * @returns {void} Creates the dialog, content, actions, and event bindings.
     */
    render() {
        this.element = document.createElement('sl-dialog');
        this.element.className = 'service-dialog';
        this.element.label = this.options.title;
        this.element.addEventListener('sl-request-close', event => {
            this.onRequestClose(event);
        });
        this.element.append(this.createContent(), ...this.createActions());
        this.autofocusTarget.setAttribute('autofocus', '');
    }

    /**
     * @returns {Promise<void>} Resolves after this dialog finishes hiding.
     */
    waitForClose() {
        return new Promise(resolve => {
            this.element.addEventListener('sl-after-hide', event => {
                if (event.target !== this.element) return;
                resolve();
            });
        });
    }

    /**
     * Waits for Shoelace's deferred trigger focus restoration before dequeuing.
     * @returns {Promise<void>}
     */
    waitForFocusRestoration() {
        return new Promise(resolve => { setTimeout(resolve, 0); });
    }

    /**
     * @returns {Promise<DialogResult>} Dismissal result after focus restoration.
     */
    async show() {
        this.render();
        const closed = this.waitForClose();
        document.body.append(this.element);
        try {
            await this.element.updateComplete;
            await this.element.show();
            await closed;
            await this.waitForFocusRestoration();
            return this.result;
        } finally {
            this.element.remove();
        }
    }
}
