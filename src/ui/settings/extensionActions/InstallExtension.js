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
        await applyInstallation(this.plan, this.onProgress);
    }
}
