import MountedDirectory from '../../../shared/MountedDirectory.js';
import { unmount } from '../../../shared/platformAdapter.js';
import {
    hasResolvedExtension, registerRuntimeExtension
} from '../../../shared/extensionManager.js';

export default class ExtensionActivation {
    static matches(row) {
        return row.type === this.type;
    }

    constructor(row, wasInstalled) {
        this.row = row;
        this.wasInstalled = wasInstalled;
    }

    get relativePath() {
        return `${this.constructor.folder}/${this.row.id}`;
    }

    get isRegistered() {
        return hasResolvedExtension(this.relativePath);
    }

    async activate() {
        if (this.wasInstalled || this.isRegistered) return false;
        const directory = new MountedDirectory(
            `${appEnvironment.paths.userExtensions}/${this.relativePath}`,
            `/extension-runtime-${crypto.randomUUID()}`
        );
        await directory.mount();
        try {
            await this.register(directory);
        } catch (error) {
            await unmount(directory.urlPath);
            throw error;
        }
        registerRuntimeExtension(this.relativePath, directory);
        return true;
    }

    async register() {}
}
