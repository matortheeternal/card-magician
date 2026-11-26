import { executeAction } from '../../../ui/systems/actionSystem.js';
import TemplateCardTest from './TemplateCardTest.js';

let sessionStarted = false;

async function openTestProject(projectPath) {
    if (sessionStarted) return executeAction('open-project', projectPath);
    sessionStarted = true;
    await executeAction('start-project', projectPath);
    if (!window.activeProject) throw new Error(`Could not open ${projectPath}`);
}

export function describeTemplateTests(project, options) {
    describe(project.templateId, () => {
        beforeAll(async () => {
            await project.clearOutput();
            await openTestProject(project.projectPath);
        });

        for (const cardName of project.cardNames) {
            it(cardName, () => {
                return new TemplateCardTest(project, cardName, options).run();
            });
        }
    });
}
