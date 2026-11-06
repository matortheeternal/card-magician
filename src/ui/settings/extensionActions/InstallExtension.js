import ExtensionAction from './ExtensionAction.js';
import { selectRelease } from '../../../domain/extensions/extensionMetadata.js';
import {
    planInstallation, applyInstallation
} from '../../../domain/extensions/extensionService.js';

const L = localize('extensions');

export default class InstallExtension extends ExtensionAction {
    static action = 'install';

    async prepare() {
        const release = selectRelease(this.releases);
        if (!release) throw new Error(L`No compatible release is available.`);
        this.plan = await planInstallation(
            this.row, release, this.installed, this.catalog
        );
    }

    get confirmation() {
        if (this.plan.length < 2) return null;
        const extensions = this.plan.map(entry =>
            `${entry.row.id} ${entry.release.version}`);
        return {
            message: L`Install these extensions?` + '\n\n' + extensions.join('\n')
        };
    }

    async apply() {
        this.result = await applyInstallation(this.plan, this.onProgress);
    }

    get completion() {
        const messages = [];
        if (this.result.activated.length)
            messages.push(L`New extensions are ready to use.`);
        if (this.result.reloadRequired.length) {
            const ids = this.result.reloadRequired.join(', ');
            messages.push(L`Reload Card Magician to apply: ${ids}.`);
        }
        for (const { id, message } of this.result.failures)
            messages.push(L`Installed ${id}, but activation failed: ${message}`);
        return { message: messages.join('\n'), error: this.result.failures.length > 0 };
    }
}
