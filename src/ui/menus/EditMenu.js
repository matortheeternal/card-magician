import ReactiveMenu from './ReactiveMenu.js';
import { executeAction } from '../systems/actionSystem.js';
import { openModal } from '../modals/modalManager.js';
import { getAvailableLocales, prepareSchema } from '../../shared/localize.js';
import * as historySystem from '../systems/historySystem.js';

const L = localize('title-bar');

export default class EditMenu extends ReactiveMenu {
    id = 'edit';
    title = L`Edit`;

    get items() {
        return [
            this.menuItem(L`Undo`, L`Ctrl+Z`, () => {
                log('user').info('Undo');
                historySystem.undo();
            }),
            this.menuItem(L`Redo`, L`Ctrl+Shift+Z`, () => {
                log('user').info('Redo');
                historySystem.redo();
            }),
            this.DIVIDER,
            this.menuItem(L`Filter`, L`Ctrl+F`, () => executeAction('toggle-filter')),
            this.menuItem(
                L`Build filter`,
                L`Ctrl+Shift+F`,
                () => openModal('cm-build-filter-modal')
            ),
            this.menuItem(L`Copy`, L`Ctrl+C`, () => executeAction('copy')),
            this.menuItem(L`Paste`, L`Ctrl+V`, () => executeAction('paste')),
            this.DIVIDER,
            this.menuItem(L`Localization`, ``, async () => {
                await prepareSchema();
                const locales = await getAvailableLocales();
                openModal('cm-edit-locales-modal', {
                    locales,
                    selectedLocale: locales[0]
                });
            }),
        ];
    }
}
