import ReactiveMenu from './ReactiveMenu.js';
import { executeAction } from '../systems/actionSystem.js';
import { openModal } from '../modals/modalManager.js';

const L = localize('title-bar');

export default class CardsMenu extends ReactiveMenu {
    id = 'cards';
    title = L`Cards`;

    get items() {
        return [
            this.menuItem(L`Add Card`, L`Ctrl+Enter`, () => executeAction('add-card')),
            this.menuItem(
                L`Delete Cards`,
                L`Delete`,
                () => executeAction('delete-selected-cards')
            ),
            this.menuItem(
                L`Duplicate Cards`,
                L`Ctrl+D`,
                () => executeAction('duplicate-selected-cards')
            ),
            this.menuItem(L`Automate`, L`Ctrl+M`, () => openModal('cm-automate-modal'))
        ];
    }
}
