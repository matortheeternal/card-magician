import platform from '../../platformAdapter.js';
import { executeAction } from '../../../ui/systems/actionSystem.js';
import { waitForCardUpdates } from '../testUtils.js';

export async function reopenProject() {
    await executeAction('open-project', activeProject.filePath);
    await waitForCardUpdates();
    return activeProject;
}

export async function emptyDataFolder(name) {
    const folder = await platform.getJoinedPath(appEnvironment.paths.data, name);
    try { await platform.rmrf(folder); } catch {}
    return folder;
}
