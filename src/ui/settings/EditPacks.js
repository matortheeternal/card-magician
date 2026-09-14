import CardMagicianSettings from './CardMagicianSettings.js';
import { registerSettings } from './settingsRegistry.js';

const L = localize('settings');

export default class EditPacks extends CardMagicianSettings {
    static id = 'cm-edit-packs';
    static parentId = 'cm-project-settings';
    static label = L`Packs`;
    static groupWeight = 512;

    static createModel() {
        return activeProject.pack;
    }

    static apply(model) {
        activeProject.pack = model;
    }

    static search(query) {
        return [];
    }

    bind() {
        super.bind();
        this.addEventListener('cm-remove-slot', event => {
            this.model.remove(event.detail);
        });
    }

    get onClickHandlers() {
        return {
            ...super.onClickHandlers,
            addSlot: () => this.addSlot()
        };
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
            `<sl-button data-click-action="addSlot">${L`Add Slot`}</sl-button>
            <div class=slots-container></div>`
        );
        this.renderSlots();
    }

    addSlot() {
        const element = document.createElement('cm-edit-slot');
        element.slot = activeGame.newPackSlot();
        this.model.push(element.slot);
        this.slotsContainer.appendChild(element);
    }
}

registerSettings(EditPacks);
