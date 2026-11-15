import sanitize from 'sanitize-filename';
import platform from '../../shared/platformAdapter.js';
import { dialogSystem } from '../../ui/systems/dialogSystem.js';

const L = localize('new-project-location');
const PROJECTS_FOLDER_KEY = 'projectsFolder';

export async function getProjectsFolder() {
    const stored = await platform.getStoredData(PROJECTS_FOLDER_KEY).catch(() => null);
    return stored?.path || appEnvironment.paths.projects;
}

async function reserveProjectPath({ name, folder }) {
    const safeName = sanitize(name).trim();
    if (!safeName) {
        await dialogSystem.alert(L`Enter a name that can be used for a folder.`);
        return undefined;
    }
    const projectFolder = await platform.getJoinedPath(folder, safeName);
    if (await platform.checkFolderExists(projectFolder)) {
        await dialogSystem.alert(L`A folder named "${safeName}" already exists there.`);
        return undefined;
    }
    return platform.getJoinedPath(projectFolder, `${safeName}.cmproj`);
}

export async function reserveNewProjectLocation(choice) {
    const filePath = await reserveProjectPath(choice);
    if (!filePath) return undefined;
    await platform.storeData(PROJECTS_FOLDER_KEY, { path: choice.folder });
    return filePath;
}
