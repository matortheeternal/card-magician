import CardMagicianSettings from './CardMagicianSettings.js';
import { registerSettings } from './settingsRegistry.js';

const L = localize('settings');

export default class EditPacks extends CardMagicianSettings {
    static id = 'cm-edit-packs';
    static parentId = 'cm-project-settings';
    static label = L`Packs`;
    static groupWeight = 512;

    static search(query) {
        return [];
    }

    get model() {
        return activeProject.pack;
    }

    bind() {
        this.handleEvents('click', {
            addSlot: () => this.addSlot()
        });
        this.addEventListener('cm-remove-slot', event => {
            this.model.remove(event.detail);
            this.emit('project-changed');
        });
    }

    get slotsContainer() {
        return this.querySelector('div.slots-container');
    }

    renderSlots() {
        for (const slot of this.model) {
            const element = document.createElement('cm-edit-slot');
            element.slot = slot;
            this.slotsContainer.appendChild(element);
        }
    }

    render() {
        this.innerHTML = (
            `<div class="header">
                <p class="text-muted">
                    ${L`Configure the booster pack structure used in certain exports.`}
                </p>
                <sl-button data-click-action="addSlot" variant="primary">
                    <sl-icon slot="prefix" name="plus-lg"></sl-icon>
                    ${L`Add Slot`}
                </sl-button>
            </div>
            <div class=slots-container></div>`
        );
        this.renderSlots();
    }

    addSlot() {
        const element = document.createElement('cm-edit-slot');
        element.slot = activeGame.newPackSlot();
        this.model.push(element.slot);
        this.slotsContainer.appendChild(element);
        this.emit('project-changed');
    }
}

registerSettings(EditPacks);
