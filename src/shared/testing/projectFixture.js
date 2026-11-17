import platform from '../platformAdapter.js';

export function useProjectOnDisk(folderName) {
    let previousProject, folder;

    beforeEach(async () => {
        previousProject = window.activeProject;
        folder = await platform.getJoinedPath(appEnvironment.paths.data, folderName);
        try { await platform.rmrf(folder); } catch {}
        const project = new activeGame.Project();
        await project.setFilePath(await platform.getJoinedPath(folder, 'test.cmproj'));
        window.activeProject = project;
    });

    afterEach(async () => {
        window.activeProject = previousProject;
        await platform.rmrf(folder);
    });
}
