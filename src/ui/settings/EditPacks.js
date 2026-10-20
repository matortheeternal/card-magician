import CardMagicianSettings from './CardMagicianSettings.js';
import { registerSettings } from './settingsRegistry.js';
import { toggleDisplay } from '../../shared/htmlUtils.js';

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
            addSlot: () => this.addSlot(),
            addDefaultSlots: () => this.addDefaultSlots(),
        });
        this.addEventListener('cm-remove-slot', event => {
            this.model.remove(event.detail);
            this.updateNoContentVisibility();
            this.emit('project-changed');
        });
    }

    get slotsContainer() {
        return this.querySelector('div.slots-container');
    }

    get noContentPrompt() {
        return this.querySelector('div.no-content-prompt');
    }

    updateNoContentVisibility() {
        toggleDisplay(this.model.length === 0, this.noContentPrompt);
    }

    renderSlots() {
        this.updateNoContentVisibility();
        this.slotsContainer.innerHMTL = '';
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
            <div class=slots-container></div>
            <div class="no-content-prompt">
                <h2>
                    ${L`No booster pack slots have been configured for this project.`}
                </h2>
                <div class="buttons-container">
                    <sl-button data-click-action="addSlot">
                        ${L`Add a slot`}
                    </sl-button>
                    <sl-button data-click-action="addDefaultSlots">
                        ${L`Add default slots`}
                    </sl-button>
                </div>
            </div>`
        );
        this.renderSlots();
    }

    addSlot() {
        const element = document.createElement('cm-edit-slot');
        element.slot = activeGame.newPackSlot();
        this.model.push(element.slot);
        this.slotsContainer.appendChild(element);
        this.updateNoContentVisibility();
        this.emit('project-changed');
    }

    addDefaultSlots() {
        activeProject.pack = activeGame.defaultPackStructure;
        this.renderSlots();
        this.emit('project-changed');
    }
}

registerSettings(EditPacks);
