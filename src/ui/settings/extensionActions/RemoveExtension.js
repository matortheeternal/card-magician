import ExtensionAction from './ExtensionAction.js';
import { removeExtension } from '../../../domain/extensions/extensionService.js';

const L = localize('extensions');

export default class RemoveExtension extends ExtensionAction {
    static action = 'remove';

    get confirmation() {
        return {
            message: L`Uninstall ${this.row.id}?`,
            options: { confirmLabel: L`Uninstall` }
        };
    }

    apply() {
        return removeExtension(this.row, this.installed);
    }
}
