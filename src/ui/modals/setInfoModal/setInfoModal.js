import Alpine from 'alpinejs';
import Modal from '../../systems/modalSystem.js';
import { registerModal } from '../modalManager.js';

const L = localize('set-info-modal');

export default class SetInfoModal extends Modal {
    title = L`Set Info`;
    static id = "cm-set-info-modal";

    constructor() {
        super();
    }

    init() {
        this.set = Alpine.store('views').activeSet;
        this.container.addEventListener('change', e => {
            const infoId = e.target.dataset?.infoId;
            if (!infoId) return;
            this.set.info[infoId] = e.target.value;
        });
    }

    renderBody() {
        if (!this.game) this.game = Alpine.store('game');
        return this.game.renderSetInfo();
    }
}

registerModal(SetInfoModal);