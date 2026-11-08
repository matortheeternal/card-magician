import platform from '../../shared/platformAdapter.js';
import {
    createTestProject, deleteTestProject, eventually
} from '../../shared/testing/testUtils.js';

describe('Project files', () => {
    beforeEach(async () => {
        await createTestProject();
        activeProject.symbol = `<svg xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 200 100"><path d="M0 0h100v100z"/></svg>`;
    });
    afterEach(async () => { await deleteTestProject(); });

    it('stops observing the old project after switching projects or saving elsewhere',
       async () => {
           const old = activeProject;
           const source = old.symbol;
           await old.saveSymbol();
           await createTestProject();
           await platform.writeFile(old.symbolPath, source.replace('200 100', '100 100'));
           await new Promise(resolve => { setTimeout(resolve, 700); });
           expect(old.symbol).toBe(source);
           const previousPath = activeProject.symbolPath;
           const destination = await platform.getJoinedPath(
               activeProject.folderPath, 'relocated', 'test.cmproj'
           );
           const originalSymbol = activeProject.symbol;
           const destinationSymbol = await platform.getJoinedPath(
               activeProject.folderPath, 'relocated', 'symbol.svg'
           );
           await platform.writeFile(destinationSymbol, source.replace('200 100', '400 100'));
           await activeProject.setFilePath(destination);
           expect(activeProject.symbol).toBe(originalSymbol);
           await platform.writeFile(previousPath, source.replace('200 100', '300 100'));
           await new Promise(resolve => { setTimeout(resolve, 700); });
           expect(activeProject.symbol).not.toContain('300 100');
           await platform.writeFile(activeProject.symbolPath, source);
           await eventually(() => activeProject.symbol === source);
       });

});
