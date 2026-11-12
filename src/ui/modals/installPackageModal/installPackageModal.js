import Modal from '../Modal.js';
import platform from '../../../shared/platformAdapter.js';
import { flushBeforeExit } from '../../../lifecycle.js';
import { showLoading, showLoadingError } from '../../systems/loadingService.js';
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

    get selectedExtensions() {
        return this.extensionCheckboxes.filter(checkbox => checkbox.checked)
            .map(checkbox => this.model.extensions[checkbox.dataset.extensionIndex])
            .filter(extension => extension.canInstall);
    }

    updateInstallButton() {
        const selectedCount = this.selectedExtensions.length;
        this.installButton.textContent = L`Install selected (${selectedCount})`;
        this.installButton.disabled = this.installing || !selectedCount;
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
            </div>`
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
        showLoading();
        try {
            const failures = await installExtensions(extensions);
            if (failures.length) {
                showLoadingError();
                return;
            }
            await flushBeforeExit();
            platform.reloadApp();
        } catch (error) {
            log('fs').error('Unable to finish extension installation and reload', error);
            showLoadingError();
        }
    }
}

registerModal(InstallPackageModal);
