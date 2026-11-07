import ReactiveMenu from './ReactiveMenu.js';
import { executeAction } from '../systems/actionSystem.js';
import { exitApp } from '../../lifecycle.js';
import { openModal } from '../modals/modalManager.js';
import { openProject } from '../../domain/projects/projectManager.js';

const L = localize('title-bar');
const pathRegex = /[\/\\]/;

export default class FileMenu extends ReactiveMenu {
    id = 'file';
    title = L`File`;

    constructor() {
        super();
        this.createProjectItem = this.createProjectItem.bind(this);
    }

    createProjectItem(project) {
        const filename = project.filePath.split(pathRegex).pop();
        return this.menuItem(
            project.title || filename,
            '',
            () => openProject(project.filePath)
        );
    }

    get items() {
        return [
            this.menuItem(
                L`New`,
                L`Ctrl+N`,
                () => executeAction('new-project')
            ),
            this.menuItem(
                L`Open`,
                L`Ctrl+O`,
                () => executeAction('open-project')
            ),
            this.menuItem(
                L`Save`,
                L`Ctrl+S`,
                () => executeAction('save-project')
            ),
            this.menuItem(
                L`Save as`,
                L`Ctrl+Shift+S`,
                () => executeAction('save-project-as')
            ),
            this.menuItemGroup(
                L`Recent projects`,
                () => {
                    const config = activeGame?.config;
                    if (!config) return [];
                    const submenuItems = config.recentProjects.map(
                        this.createProjectItem
                    );
                    config.onRecentProjectsChanged(projects => {
                        submenuItems.splice(0);
                        submenuItems.push(...projects.map(this.createProjectItem));
                        changed(submenuItems);
                    });
                    return submenuItems;
                }
            ),
            this.DIVIDER,
            this.desktopMenuItem(
                L`Settings`,
                `Ctrl+Alt+S`,
                () => openModal('cm-settings-modal')
            ),
            this.DIVIDER,
            this.desktopMenuItem(
                L`Import MSE set`,
                ``,
                () => executeAction('import-mse-set')
            ),
            this.menuItem(
                L`Export current card`,
                ``,
                () => executeAction('export-card-image')
            ),
            this.desktopMenuItem(L`Print`, L`Ctrl+P`, () => log('user').info('Print')),
            this.DIVIDER,
            this.desktopMenuItem(L`Exit`, ``, () => exitApp().catch(() => {})),
        ];
    }
}
