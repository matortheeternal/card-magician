import ReactiveMenu from './ReactiveMenu.js';
import { executeAction } from '../systems/actionSystem.js';
import { openModal } from '../modals/modalManager.js';
import { getAvailableLocales, prepareSchema } from '../../shared/localize.js';
import { getTags } from '../../domain/game/tagManager.js';

const L = localize('title-bar');

export default class EditMenu extends ReactiveMenu {
    id = 'edit';
    title = L`Edit`;

    get items() {
        return [
            this.menuItem(L`Undo`, L`Ctrl+Z`, () => log('user').info('Undo')),
            this.menuItem(L`Redo`, L`Ctrl+Shift+Z`, () => log('user').info('Redo')),
            this.DIVIDER,
            this.menuItem(L`Find`, L`Ctrl+F`, () => executeAction('toggle-search')),
            this.menuItem(L`Cut`, L`Ctrl+X`, () => executeAction('cut')),
            this.menuItem(L`Copy`, L`Ctrl+C`, () => executeAction('copy')),
            this.menuItem(L`Paste`, L`Ctrl+V`, () => executeAction('paste')),
            this.DIVIDER,
            this.menuItem(L`Set Info`, ``, () => {
                openModal('cm-set-info-modal', activeProject);
            }),
            this.menuItem(L`Tags`, ``, () => {
                openModal('cm-edit-tags-modal', getTags());
            }),
            this.menuItem(L`Packs`, ``, () => {
                openModal('cm-edit-packs-modal');
            }),
            this.menuItem(L`Preferences`, ``, () => log('user').info('Edit preferences')),
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
