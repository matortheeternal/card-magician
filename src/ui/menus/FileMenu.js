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
                () => executeAction('new-set')
            ),
            this.menuItem(
                L`Open`,
                L`Ctrl+O`,
                () => executeAction('open-set')
            ),
            this.menuItem(
                L`Save`,
                L`Ctrl+S`,
                () => executeAction('save-set')
            ),
            this.menuItem(
                L`Save as`,
                L`Ctrl+Shift+S`,
                () => executeAction('save-set-as')
            ),
            this.DIVIDER,
            this.menuItem(
                L`Export current card`,
                ``,
                () => executeAction('export-card-image')
            ),
            this.menuItem(L`Print`, L`Ctrl+P`, () => log('user').info('Print')),
            this.DIVIDER,
            this.menuItem(L`Exit`, ``, () => exitApp()),
        ];
    }
}
