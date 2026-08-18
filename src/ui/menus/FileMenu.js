import ReactiveMenu from './ReactiveMenu.js';
import { executeAction } from '../systems/actionSystem.js';
import { exitApp } from '../../shared/neutralinoAdapter.js';

const L = localize('title-bar');

export default class FileMenu extends ReactiveMenu {
    id = 'file';
    title = L`File`;

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
            this.desktopMenuItem(L`Exit`, ``, () => exitApp()),
        ];
    }
}
