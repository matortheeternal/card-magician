import CardMagicianSettings from './CardMagicianSettings.js';
import { registerSettings } from './settingsRegistry.js';
import { registryService } from '../../domain/extensions/registryService.js';
import { mergeExtensions } from '../../domain/extensions/extensionMetadata.js';
import { installedExtensions } from '../../domain/extensions/extensionService.js';
import { createExtensionAction } from './extensionActions/actionRegistry.js';
import '../components/extensionResults/ExtensionResults.js';
import '../components/extensionDetails/ExtensionDetails.js';

const L = localize('extensions');

export default class ExtensionSettings extends CardMagicianSettings {
    static id = 'cm-extension-settings';
    static label = L`Extensions`;
    static groupWeight = 512;

    static async search() {
        return [];
    }

    catalog = [];
    installed = [];
    warnings = [];
    loading = false;

    bind() {
        this.on('sl-input', () => this.filterResults());
        this.on('sl-change', () => this.filterResults());
        this.on('extension-selection-changed', () => this.showSelectedExtension());
        this.on('extension-results-changed', event => {
            this.showResultCount(event.detail.count);
        });
        this.on('extension-action', event => this.perform(event.detail.action));
        this.on('registry-offline', () => this.showOfflineMessage());
        this.handleEvents('click', { refresh: () => this.load(true) });
        void this.load();
    }

    get searchControl() {
        return this.querySelector('.extension-search');
    }

    get typeControl() {
        return this.querySelector('.extension-type');
    }

    get installedControl() {
        return this.querySelector('.extension-installed');
    }

    get refreshControl() {
        return this.querySelector('[data-click-action="refresh"]');
    }

    get resultsControl() {
        return this.querySelector('cm-extension-results');
    }

    get detailsControl() {
        return this.querySelector('cm-extension-details');
    }

    get selected() {
        return this.resultsControl.selected;
    }

    get filters() {
        const type = this.typeControl.value;
        return {
            query: this.searchControl.value,
            type: type === 'all' ? '' : type,
            installed: this.installedControl.checked
        };
    }

    message(value, error = false) {
        const element = this.querySelector('.extension-status');
        element.textContent = value;
        element.setAttribute('role', error ? 'alert' : 'status');
    }

    showOfflineMessage() {
        this.message(L`Offline. Showing cached registry information.`);
    }

    showLoadMessage() {
        if (registryService.offline) return this.showOfflineMessage();
        if (this.warnings.length) {
            this.message(L`Some extension manifests could not be read.`, true);
            return;
        }
        this.message('');
    }

    async load(refresh = false) {
        this.loading = true;
        this.message(L`Loading extensions…`);
        try {
            await this.loadInstalled();
            if (!await this.loadCatalog(refresh)) return;
            this.showLoadMessage();
        } catch (error) {
            this.message(error.message, true);
        } finally {
            this.loading = false;
        }
    }

    async loadInstalled() {
        const local = await installedExtensions();
        this.installed = local.extensions;
        this.warnings = local.warnings;
        this.updateRows();
    }

    async loadCatalog(refresh) {
        try {
            this.catalog = await registryService.catalog({ refresh });
        } catch {
            this.message(L`Registry unavailable. Showing installed extensions.`, true);
            return false;
        }
        this.updateRows();
        return true;
    }

    async refreshInstalled() {
        try {
            await this.loadInstalled();
        } catch (error) {
            this.message(error.message, true);
        }
    }

    updateRows() {
        if (!this.isConnected) return;
        const rows = mergeExtensions(this.catalog, this.installed);
        this.resultsControl.show(rows, this.filters);
    }

    filterResults() {
        this.resultsControl.filter(this.filters);
    }

    showResultCount(count) {
        this.querySelector('.extension-count').textContent = `${count} ${L`extensions`}`;
    }

    showSelectedExtension() {
        if (this.detailsControl.extension === this.selected) return;
        void this.detailsControl.show(this.selected);
    }

    getAction(name) {
        return createExtensionAction(name, {
            row: this.selected,
            releases: this.detailsControl.versions,
            installed: this.installed,
            catalog: this.catalog,
            onProgress: id => this.message(L`Installing ${id}…`)
        });
    }

    showCompletion(completion) {
        this.message(completion.message, completion.error);
    }

    async perform(name) {
        if (!this.selected) return;
        const action = this.getAction(name);
        if (!action) return;
        try {
            if (await action.execute()) this.showCompletion(action.completion);
        } catch (error) {
            this.message(error.message, true);
        } finally {
            await this.refreshInstalled();
        }
    }

    render() {
        this.innerHTML = `<div class="search-and-filters">
            <div class="extension-toolbar">
                <sl-input class="extension-search" clearable
                    label="${L`Search extensions`}"
                    placeholder="${L`Search ID, name, or author`}">
                </sl-input>
                <sl-select class="extension-type" label="${L`Type`}" value="all">
                    <sl-option value="all">${L`All types`}</sl-option>
                    <sl-option value="game">${L`Games`}</sl-option>
                    <sl-option value="template">${L`Templates`}</sl-option>
                    <sl-option value="cardpart">${L`Cardparts`}</sl-option>
                    <sl-option value="exporter">${L`Exporters`}</sl-option>
                </sl-select>
                <sl-switch class="extension-installed">${L`Installed only`}</sl-switch>
                <sl-button data-click-action="refresh">${L`Refresh`}</sl-button>
            </div>
            <p class="extension-status text-muted" role="status" aria-live="polite"></p>
            <p class="extension-count text-muted" aria-live="polite"></p>
        </div>
        <div class="extension-browser">
            <cm-extension-results role="region" aria-label="${L`Extension results`}">
            </cm-extension-results>
            <cm-extension-details aria-label="${L`Extension details`}">
            </cm-extension-details>
        </div>`;
    }
}

registerSettings(ExtensionSettings);
