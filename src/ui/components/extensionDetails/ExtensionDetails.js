import semver from 'semver';
import ReactiveComponent from '../ReactiveComponent.js';
import { registryService } from '../../../domain/extensions/registryService.js';
import { escapeHTML } from '../../../shared/htmlUtils.js';
import detailFields from './extensionDetailFields.js';
import {
    normalizeVersion, selectRelease
} from '../../../domain/extensions/extensionMetadata.js';

const L = localize('extensions');
const text = value => escapeHTML(String(value ?? ''));

export default class ExtensionDetails extends ReactiveComponent {
    model = { row: null, versions: [], loading: false, error: '' };
    release = null;
    requestId = 0;

    get extension() {
        return this.model.row;
    }

    get versions() {
        return this.model.versions;
    }

    get canLoadReleases() {
        return !!this.extension && !this.extension.installed?.builtIn;
    }

    disconnectedCallback() {
        this.requestId++;
        super.disconnectedCallback();
    }

    async show(row) {
        const requestId = ++this.requestId;
        this.model.row = row;
        this.model.versions = [];
        this.model.error = '';
        this.model.loading = this.canLoadReleases;
        this.render();
        if (!this.canLoadReleases) return;
        await this.loadReleases(requestId);
    }

    isCurrentRequest(requestId) {
        return this.isConnected && this.requestId === requestId;
    }

    async loadReleases(requestId) {
        try {
            const versions = await registryService.versions(this.extension.id);
            if (!this.isCurrentRequest(requestId)) return;
            this.model.versions = versions;
            if (registryService.offline) this.emit('registry-offline');
        } catch (error) {
            if (!this.isCurrentRequest(requestId)) return;
            this.model.error = error.message;
        } finally {
            this.finishLoading(requestId);
        }
    }

    finishLoading(requestId) {
        if (!this.isCurrentRequest(requestId)) return;
        this.model.loading = false;
        this.render();
    }

    connectedCallback() {
        this.handleEvents('click', {
            install: () => this.emit('extension-action', { action: 'install' }),
            remove: () => this.emit('extension-action', { action: 'remove' })
        });
        this.render();
    }

    get installed() {
        return this.extension.installed;
    }

    get metadata() {
        return this.release?.metadata ?? this.extension.metadata;
    }

    get title() {
        return this.metadata.label || this.metadata.name || this.extension.id;
    }

    get author() {
        if (this.metadata.author) return this.metadata.author;
        if (Array.isArray(this.metadata.authors)) return this.metadata.authors.join(', ');
        return null;
    }

    get installedVersion() {
        if (!this.installed) return L`Not installed`;
        return this.installed.version;
    }

    get currentVersion() {
        return normalizeVersion(this.installed?.version);
    }

    get isUpdate() {
        const current = this.currentVersion;
        if (!current || !this.release) return false;
        return semver.gt(this.release.version, current);
    }

    get isRevoked() {
        const current = this.currentVersion;
        return this.versions.some(version =>
            version.version === current && version.state === 'revoked');
    }

    get canInstall() {
        if (!this.release || this.installed?.builtIn) return false;
        return !this.installed || this.isUpdate;
    }

    get canUninstall() {
        return !!this.installed && !this.installed.bundled;
    }

    get downloadSize() {
        if (!this.release) return null;
        const size = this.release.size;
        if (size < 1024 * 1024)
            return `${Math.max(1, Math.ceil(size / 1024))} KiB`;
        return `${(size / 1024 / 1024).toFixed(1)} MiB`;
    }

    get installLabel() {
        if (this.isUpdate) return L`Update`;
        return L`Install`;
    }

    get uninstallLabel() {
        if (this.installed.hasBundled) return L`Remove update`;
        return L`Uninstall`;
    }

    renderHeader() {
        return (
            `<header>
                <h3>${text(this.title)}</h3>
                <p class="text-muted extension-id">${text(this.extension.id)}</p>
            </header>`
        );
    }

    renderDescription() {
        if (!this.metadata.description) return '';
        return `<p>${text(this.metadata.description)}</p>`;
    }

    renderDetail(label, value) {
        return `<dt>${text(label)}</dt><dd>${text(value)}</dd>`;
    }

    renderDetails() {
        const html = [];
        for (const detail of detailFields) {
            const value = detail.getValue(this);
            if (value === null || value === undefined || value === '') continue;
            html.push(this.renderDetail(detail.label, value));
        }
        return `<dl>${html.join('\n')}</dl>`;
    }

    renderLoading() {
        if (!this.model.loading) return '';
        return `<p role="status">${L`Loading releases…`}</p>`;
    }

    renderError() {
        if (!this.model.error) return '';
        return `<p role="alert">${text(this.model.error)}</p>`;
    }

    renderRevokedWarning() {
        if (!this.isRevoked) return '';
        return (
            `<p class="extension-warning">
                ${L`The installed release has been revoked.`}
            </p>`
        );
    }

    renderBundledNotice() {
        if (!this.installed?.bundled) return '';
        return (
            `<p class="text-muted">
                ${L`Included with Card Magician.`}
            </p>`
        );
    }

    renderMessages() {
        return [
            this.renderLoading(),
            this.renderError(),
            this.renderRevokedWarning(),
            this.renderBundledNotice()
        ].join('\n');
    }

    renderInstallAction() {
        if (!this.canInstall) return '';
        return (
            `<sl-button variant="primary" data-click-action="install">
                ${this.installLabel}
            </sl-button>`
        );
    }

    renderUninstallAction() {
        if (!this.canUninstall) return '';
        return (
            `<sl-button variant="danger" data-click-action="remove">
                ${this.uninstallLabel}
            </sl-button>`
        );
    }

    renderActions() {
        return (
            `<div class="extension-actions">
                ${this.renderInstallAction()}
                ${this.renderUninstallAction()}
            </div>`
        );
    }

    render() {
        this.release = selectRelease(this.versions);
        if (!this.extension) {
            this.innerHTML = `<p class="text-muted">${L`Select an extension.`}</p>`;
            return;
        }
        this.innerHTML = [
            this.renderHeader(),
            this.renderDescription(),
            this.renderDetails(),
            this.renderMessages(),
            this.renderActions(),
        ].join('\n');
    }
}

customElements.define('cm-extension-details', ExtensionDetails);
