import { registerModal } from '../modalManager.js';
import Modal from '../Modal.js';

const L = localize('edit-packs-modal');

export default class EditPacksModal extends Modal {
    static id = 'cm-edit-packs-modal';
    title = L`Edit Packs`;

    connectedCallback() {
        super.connectedCallback();
        this.renderSlots();
    }

    bind() {
        super.bind();
        this.addEventListener('cm-remove-slot', event => {
            activeProject.pack.remove(event.detail);
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
        for (const slot of activeProject.pack) {
            const element = document.createElement('cm-edit-slot');
            element.slot = slot;
            this.slotsContainer.appendChild(element);
        }
    }

    renderBody() {
        return (
            `<div class=slots-container></div>`
        );
    }

    renderActions() {
        return (
            `<sl-button data-click-action="addSlot">${L`Add Slot`}</sl-button>
            <sl-button data-click-action="close">${L`Close`}</sl-button>`
        );
    }

    addSlot() {
        const element = document.createElement('cm-edit-slot');
        element.slot = activeGame.newPackSlot();
        activeProject.pack.push(element.slot);
        this.slotsContainer.appendChild(element);
    }
}

registerModal(EditPacksModal);
