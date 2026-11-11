import Modal from '../Modal.js';
import { registerModal } from '../modalManager.js';
import { installExtensions } from '../../../domain/extensions/extensionManager.js';
import { renderExtensionGroups } from './extensionGroups.js';
import { renderExtensionSummary } from './extensionSummary.js';

const L = localize('install-package-modal');

export default class InstallPackageModal extends Modal {
    static id = 'cm-install-package-modal';
    title = L`Install Extensions`;
    installing = false;
    hideUnavailable = false;

    bind() {
        super.bind();
        this.addEventListener('sl-change', () => {
            this.updateAvailabilityFilter();
            this.updateInstallButton();
        });
        this.updateAvailabilityFilter();
        this.updateInstallButton();
    }

    get onClickHandlers() {
        return {
            ...super.onClickHandlers,
            install: () => this.install()
        };
    }

    get extensionCheckboxes() {
        return [...this.querySelectorAll('sl-checkbox[data-extension-index]')];
    }

    get summary() {
        return this.querySelector('.summary-counts');
    }

    get availabilityFilter() {
        return this.querySelector('[data-hide-unavailable]');
    }

    updateAvailabilityFilter() {
        this.hideUnavailable = this.availabilityFilter?.checked ?? false;
        this.extensionList?.toggleAttribute('data-filtered', this.hideUnavailable);
    }

    get extensionList() {
        return this.querySelector('.extensions');
    }

    get installButton() {
        return this.querySelector('[data-click-action="install"]');
    }

    get cancelButton() {
        return this.querySelector('[data-click-action="close"]');
    }

    get statusMessage() {
        return this.querySelector('[role="status"]');
    }

    get selectedExtensions() {
        return this.extensionCheckboxes.filter(checkbox => checkbox.checked)
            .map(checkbox => this.model.extensions[checkbox.dataset.extensionIndex])
            .filter(extension => extension.canInstall);
    }

    updateInstallButton() {
        const selectedCount = this.selectedExtensions.length;
        this.installButton.textContent = L`Install selected (${selectedCount})`;
        this.installButton.disabled = this.installing || !selectedCount;
        this.installButton.loading = this.installing;
        if (!this.summary) return;
        this.summary.innerHTML = renderExtensionSummary(
            this.model.extensions, this.selectedExtensions.length
        );
    }

    renderBody() {
        const extensions = this.model.extensions;
        if (!extensions.length)
            return `<p>${L`This package contains no extensions.`}</p>`;
        return (
            `<header class="extension-summary">
                <div class="summary-counts" aria-live="polite"></div>
                <sl-checkbox data-hide-unavailable
                    ${this.hideUnavailable ? 'checked' : ''}>
                    ${L`Hide unavailable`}
                </sl-checkbox>
            </header>
            <div class="extensions" tabindex="0" role="region"
                aria-label="${L`Extensions available in this package`}">
                ${renderExtensionGroups(extensions)}
                ${this.renderFilteredEmptyState()}
            </div>
            <p role="status" aria-live="polite"></p>`
        );
    }

    renderFilteredEmptyState() {
        if (this.model.extensions.some(extension => extension.canInstall)) return '';
        return `<p>${L`No extensions are available to install.`}</p>`;
    }

    renderActions() {
        return (
            `<sl-button data-click-action="install" variant="primary">
                ${L`Install`}
            </sl-button>
            <sl-button data-click-action="close">${L`Cancel`}</sl-button>`
        );
    }

    close() {
        if (this.installing) return;
        super.close();
    }

    async install() {
        if (this.installing) return;
        const extensions = this.selectedExtensions;
        if (!extensions.length) return;
        this.installing = true;
        this.setControlsDisabled(true);
        this.updateInstallButton();
        const failures = await installExtensions(extensions);
        this.installing = false;
        this.render();
        this.updateAvailabilityFilter();
        this.updateInstallButton();
        this.statusMessage.textContent = failures.length
            ? L`Some extensions could not be installed. You can retry them.`
            : L`Installation complete. Reload the application to load the changes.`;
    }

    setControlsDisabled(disabled) {
        for (const checkbox of this.extensionCheckboxes) checkbox.disabled = disabled;
        this.cancelButton.disabled = disabled;
    }
}

registerModal(InstallPackageModal);
