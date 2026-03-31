import ReactiveMenu from './ReactiveMenu.js';
import { executeAction } from '../systems/actionSystem.js';
import { openModal } from '../modals/modalManager.js';
import { getActiveSet, getActiveSkeleton } from '../../domain/sets/setManager.js';
import { getAvailableLocales, prepareSchema } from '../../shared/localize.js';

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
                openModal('cm-set-info-modal', getActiveSet());
            }),
            this.menuItem(L`Set Skeleton`, ``, () => {
                openModal('cm-edit-skeleton-modal', getActiveSkeleton());
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
