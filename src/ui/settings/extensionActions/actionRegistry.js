import InstallExtension from './InstallExtension.js';
import RemoveExtension from './RemoveExtension.js';

const actions = [InstallExtension, RemoveExtension];

export function createExtensionAction(name, context) {
    const Action = actions.find(action => action.matches(name));
    return Action ? new Action(context) : null;
}
